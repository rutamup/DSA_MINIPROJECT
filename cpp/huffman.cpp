#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <cctype>
#include <sstream>

// Standard Min-BST / Min-Priority Queue Huffman Tree implementation
// Refactored to serialize tree, frequency map, and code table to JSON

struct HuffmanNode {
    char data;
    int freq;
    HuffmanNode *left;
    HuffmanNode *right;

    HuffmanNode(char d, int f) : data(d), freq(f), left(nullptr), right(nullptr) {}
    HuffmanNode(int f, HuffmanNode *l, HuffmanNode *r) : data('\0'), freq(f), left(l), right(r) {}
};

// BST Priority Structure Node
struct BSTNode {
    HuffmanNode *treeNode;
    BSTNode *left;
    BSTNode *right;

    BSTNode(HuffmanNode *node) : treeNode(node), left(nullptr), right(nullptr) {}
};

// BST-based Priority Queue matching the core algorithm
class BSTPriorityQueue {
private:
    BSTNode *root;

    BSTNode* insertHelper(BSTNode *curr, HuffmanNode *node) {
        if (!curr) return new BSTNode(node);
        if (node->freq < curr->treeNode->freq) {
            curr->left = insertHelper(curr->left, node);
        } else {
            curr->right = insertHelper(curr->right, node);
        }
        return curr;
    }

    BSTNode* extractMinHelper(BSTNode *curr, BSTNode *&minNode, BSTNode *parent = nullptr) {
        if (!curr) return nullptr;
        if (!curr->left) {
            minNode = curr;
            return curr->right;
        }
        curr->left = extractMinHelper(curr->left, minNode, curr);
        return curr;
    }

public:
    BSTPriorityQueue() : root(nullptr) {}

    void insert(HuffmanNode *node) {
        root = insertHelper(root, node);
    }

    HuffmanNode* extractMin() {
        if (!root) return nullptr;
        BSTNode *minNode = nullptr;
        root = extractMinHelper(root, minNode);
        HuffmanNode *res = minNode ? minNode->treeNode : nullptr;
        delete minNode;
        return res;
    }

    bool empty() const {
        return root == nullptr;
    }
};

class Huffman {
private:
    static void generateCodes(HuffmanNode *root, const std::string &code, std::map<char, std::string> &codes) {
        if (!root) return;
        // Leaf node check
        if (!root->left && !root->right) {
            codes[root->data] = code.empty() ? "0" : code;
            return;
        }
        if (root->left) generateCodes(root->left, code + "0", codes);
        if (root->right) generateCodes(root->right, code + "1", codes);
    }

    static std::string escapeJsonString(const std::string &s) {
        std::ostringstream o;
        for (char c : s) {
            if (c == '"') o << "\\\"";
            else if (c == '\\') o << "\\\\";
            else if (c == '\b') o << "\\b";
            else if (c == '\f') o << "\\f";
            else if (c == '\n') o << "\\n";
            else if (c == '\r') o << "\\r";
            else if (c == '\t') o << "\\t";
            else if ((unsigned char)c < 32) {
                o << "\\u00" << ((c >> 4) < 10 ? (char)('0' + (c >> 4)) : (char)('a' + (c >> 4) - 10))
                             << ((c & 0xF) < 10 ? (char)('0' + (c & 0xF)) : (char)('a' + (c & 0xF) - 10));
            } else {
                o << c;
            }
        }
        return o.str();
    }

    static std::string serializeTree(HuffmanNode *root, int id = 0) {
        if (!root) return "null";
        std::ostringstream ss;
        ss << "{";
        ss << "\"id\":" << id << ",";
        ss << "\"freq\":" << root->freq << ",";
        if (!root->left && !root->right) {
            std::string ch(1, root->data);
            ss << "\"isLeaf\":true,";
            ss << "\"symbol\":\"" << escapeJsonString(ch) << "\",";
            ss << "\"charCode\":" << (int)(unsigned char)root->data << ",";
            ss << "\"left\":null,\"right\":null";
        } else {
            ss << "\"isLeaf\":false,";
            ss << "\"symbol\":null,";
            ss << "\"charCode\":null,";
            ss << "\"left\":" << serializeTree(root->left, id * 2 + 1) << ",";
            ss << "\"right\":" << serializeTree(root->right, id * 2 + 2);
        }
        ss << "}";
        return ss.str();
    }

public:
    static std::string encode(const std::string &input, bool onlyAlnum = false) {
        std::string text = "";
        for (char c : input) {
            if (!onlyAlnum || isalnum(static_cast<unsigned char>(c))) {
                text += c;
            }
        }

        if (text.empty()) {
            return "{\"empty\":true,\"originalLength\":0,\"encodedBitString\":\"\",\"codes\":{},\"frequencies\":{},\"tree\":null}";
        }

        std::map<char, int> freqMap;
        for (char c : text) {
            freqMap[c]++;
        }

        // Special case: Single unique character
        if (freqMap.size() == 1) {
            char singleChar = freqMap.begin()->first;
            int count = freqMap.begin()->second;
            HuffmanNode *root = new HuffmanNode(singleChar, count);
            std::map<char, std::string> codes;
            codes[singleChar] = "0";

            std::string encodedBitString(count, '0');

            std::ostringstream json;
            json << "{";
            json << "\"empty\":false,";
            json << "\"originalLength\":" << text.size() << ",";
            json << "\"uniqueSymbols\":" << 1 << ",";
            json << "\"encodedBitString\":\"" << encodedBitString << "\",";
            json << "\"codes\":{\"" << escapeJsonString(std::string(1, singleChar)) << "\":\"0\"},";
            json << "\"frequencies\":{\"" << escapeJsonString(std::string(1, singleChar)) << "\":" << count << "},";
            json << "\"tree\":" << serializeTree(root) << ",";
            json << "\"isSingleChar\":true";
            json << "}";
            delete root;
            return json.str();
        }

        BSTPriorityQueue pq;
        for (auto const &[ch, count] : freqMap) {
            pq.insert(new HuffmanNode(ch, count));
        }

        while (!pq.empty()) {
            HuffmanNode *left = pq.extractMin();
            if (pq.empty()) {
                // tree complete
                std::map<char, std::string> codes;
                generateCodes(left, "", codes);

                std::string encodedBits = "";
                for (char c : text) {
                    encodedBits += codes[c];
                }

                std::ostringstream json;
                json << "{";
                json << "\"empty\":false,";
                json << "\"originalLength\":" << text.size() << ",";
                json << "\"uniqueSymbols\":" << freqMap.size() << ",";
                json << "\"encodedBitString\":\"" << encodedBits << "\",";
                
                json << "\"codes\":{";
                bool first = true;
                for (auto const &[ch, code] : codes) {
                    if (!first) json << ",";
                    first = false;
                    json << "\"" << escapeJsonString(std::string(1, ch)) << "\":\"" << code << "\"";
                }
                json << "},";

                json << "\"frequencies\":{";
                first = true;
                for (auto const &[ch, count] : freqMap) {
                    if (!first) json << ",";
                    first = false;
                    json << "\"" << escapeJsonString(std::string(1, ch)) << "\":" << count;
                }
                json << "},";

                json << "\"tree\":" << serializeTree(left) << ",";
                json << "\"isSingleChar\":false";
                json << "}";

                // Free memory
                struct Cleaner {
                    static void free(HuffmanNode *node) {
                        if (!node) return;
                        free(node->left);
                        free(node->right);
                        delete node;
                    }
                };
                Cleaner::free(left);

                return json.str();
            }

            HuffmanNode *right = pq.extractMin();
            HuffmanNode *parent = new HuffmanNode(left->freq + right->freq, left, right);
            pq.insert(parent);
        }

        return "{}";
    }
};

int main() {
    std::string sample = "abracadabra";
    std::cout << Huffman::encode(sample, false) << std::endl;
    return 0;
}
