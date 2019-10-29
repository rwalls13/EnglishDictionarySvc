To test EnglishDictionaryService, open a console/terminal window, cd to this folder, and run:

node lookupPrefix

The service object will be created and loaded from "words.txt", and then you will be continuously prompted to enter a
prefix to look up.  Hitting Enter without characters will exit the program.  Entering less than 3 characters for the
prefix will yield no results.  Otherwise, all words in the words file that begin with the entered prefix will be
displayed to stdout.

To run the same test with a different file, e.g. words_alpha.txt, modify the "wordsFilepath" at the top of EnglishDictionaryService.js.