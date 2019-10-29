'use strict';
const fs = require('fs');

//const wordsFilepath = __dirname + '/words_alpha.txt';
const wordsFilepath = __dirname + '/words.txt';

function TrieNode(value) {
    this.value = value;
    this.children = {};
    this.isLeaf = false;
}


class Trie {

    constructor() {
        this.trieRoot = new TrieNode(null);
    }

    add( word ) {
        if ( !word || typeof word !== 'string' || word.length < 3 )
        {
            // word not given, not a string, or not at least 3 characters
            return false;
        }

        let curNode = this.trieRoot;
        // Make sure matching will be lowercase
        let lower = word.toLowerCase();

        // For each character of word
        for ( let i = 0; i < lower.length; i++ )
        {
            let curChar = lower[i];
            if ( !curNode.children[curChar] )
            {
                // add node with character
                curNode.children[curChar] = new TrieNode(curChar);
            }
            // now use new/existing node for character
            curNode = curNode.children[curChar];
        }

        curNode.isLeaf = true;
        return true;
    }

    match( prefix, limit ) {

        let result = [];
        if ( !prefix || typeof prefix !== 'string' || prefix.length < 3 )
        {
            // Prefix not given, not a string, or not at least 3 characters
            return result;
        }

        let curNode = this.trieRoot;

        // Follow trie to find nodes of prefix characters.
        // curNode will represent the node of the last character of the prefix
        // to start retrieving matches for.
        for ( let i = 0; i < prefix.length; i++ )
        {
            if ( curNode.children[prefix[i]] )
            {
                curNode = curNode.children[prefix[i]];
            }
            else
            {
                // Node not found for character.  Return empty list.
                return result;
            }
        }
        // chop the last character from prefix so the collectWords() below doesn't re-add it.
        prefix = prefix.slice(0, prefix.length-1);

        // Collect all words that match the prefix from the subtree found above.
        let collectWords = (node, suffix, length) => {
            if ( !node ) return;

            if ( node.value )
            {
                // Node has a character.  Add it to the suffix.
                suffix[length++] = node.value;
            }

            if ( node.isLeaf )
            {
                // Node represents the end of a word.
                // Add accumulated suffix to results array.
                result.push(prefix + suffix.slice(0, length).join(""));
            }

            // If result limit was given and it is reached, stop traversing.
            if ( limit && result.length >= limit ) return;

            // Walk the children of the current node to collect
            // the longer words that match the prefix.
            Object.keys(node.children).forEach((key) => {
                collectWords(node.children[key], suffix, length);
            });
        };

        collectWords(curNode, [], 0);
        return result;
    }
}


class EnglishDictionaryService {

    constructor() {
        this.trie = null;
    }

    load() {
        return new Promise((resolve, reject) => {
            const reLineDelim = /\n|\r|\r\n/;
            let wordCount = 0;
            const timeStart = process.hrtime();
            let stream = fs.createReadStream(wordsFilepath);

            this.trie = new Trie();

            stream.on('data', (chunk) => {
                let words = chunk.toString().split(reLineDelim);
                for ( let i = 0; i < words.length; i++ )
                {
                    if ( words[i] )
                    {
                        if ( this.trie.add(words[i]) )
                        {
                            wordCount++;
                        }
                    }
                }
            });
            stream.on('error', (err) => {
                console.log("FAIL load");
                reject(err);
            });
            stream.on('end', () => {
                const diff = process.hrtime(timeStart);
                console.log("Total Words loaded in Trie = " + wordCount);
                console.log(`Time to Load:  ${(diff[0] * 1e9 + diff[1])/1e9} secs`);
                resolve();
            });
        });
    }


    findMatches(prefix) {
        if ( !this.trie )
        {
            throw new Error("EnglishDictionaryService NOT loaded!")
        }
        return this.trie.match(prefix);
    }
}

module.exports = EnglishDictionaryService;
