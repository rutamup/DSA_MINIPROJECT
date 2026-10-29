#include<iostream>
#include<string>
#include<cctype>
using namespace std;

class Node{
	char ch;
	int freq;
	Node *left,*right;
	Node(char c,int f){
        	ch=c;
        	freq=f;
        	left=nullptr;
        	right=nullptr;
    	}
	friend class HoffmanBST;
};
class HoffmanBST{
    	Node *root;
    	int count;
    	Node* insert(Node *r,Node *n){
    		if(r==nullptr){
            return n;
        }
        if(n->freq<r->freq){
            r->left=insert(r->left,n);
        }else{
            r->right=insert(r->right,n);
        }
        return r;
    }
    Node* extractMin(Node* &r){
        if(r==nullptr){
            return nullptr;
        }
        if(r->left==nullptr){
            Node *temp=r;
            r=r->right;
            temp->right=nullptr;
            return temp;
        }
        return extractMin(r->left);
    }
    void generateCodes(Node *r,string code){
        if(r==nullptr){
            return;
        }
        if(r->left==nullptr&&r->right==nullptr){
            cout<<r->ch<<" : "<<code<<endl;
            return;
        }
        generateCodes(r->left,code+"0");
        generateCodes(r->right,code+"1");
    }
public:
    HoffmanBST(){
        root=nullptr;
        count=0;
    }

    void buildTree(string s){
        int freq[256]={0};

        for(char c:s){
            unsigned char ch=c;

            if(isalnum(ch)){
                freq[ch]++;
            }
        }

        for(int i=0;i<256;i++){
            if(freq[i]>0){
                Node *n=new Node((char)i,freq[i]);
                root=insert(root,n);
                count++;
            }
        }

        while(count>1){
            Node *first=extractMin(root);
            Node *second=extractMin(root);

            Node *parent=new Node('\0',
                                  first->freq+second->freq);

            parent->left=first;
            parent->right=second;

            root=insert(root,parent);
            count--;
        }
    }

    void displayCodes(){
        if(root==nullptr){
            cout<<"No valid characters found."<<endl;
            return;
        }

        if(root->left==nullptr&&root->right==nullptr){
            cout<<root->ch<<" : 0"<<endl;
            return;
        }

        generateCodes(root,"");
    }
};

int main(){
    string s;

    cout<<"Enter a string: ";
    getline(cin,s);

    HoffmanBST h;
    h.buildTree(s);

    cout<<"\nHuffman Codes:\n";
    h.displayCodes();

    return 0;
}