const EnglishDictionaryService = require('./EngilshDictionaryService');
const readline = require('readline');

let doLookup = async function() {
    return new Promise((resolve, reject) => {
        console.log("");
        rl.question('Enter a 3-letter prefix to look up (RET to quit): ', (prefix) => {
            if ( !prefix )
            {
                return reject(new Error("Goodbye"));
            }
            resolve(prefix);
        });
    })

};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let svc = new EnglishDictionaryService();

svc.load()
    .then(async () => {
        do {
            let prefix = await doLookup();

            console.log(`Looking up '${prefix}'...`);
            let results = svc.findMatches(prefix);
            console.log(`Results for '${prefix}':`);
            if ( results.length === 0 )
            {
                console.log("    NONE FOUND")
            }
            else {
                results.forEach((word) => {
                    console.log(`    '${word}'`)
                })
            }
        } while ( true );

        rl.close();
        process.exit();
    })
    .catch((err) => {
        rl.close();
        console.log(err.message);
        process.exit();
    });


/*
 * Below would be an example of an Express 4.x endpoint that would invoke the match() method
 * of the service and return the results in a JSON body.  Exception handling and error
 * responses omitted for brevity.
 *
 * Resource Path:
 *     GET  /autocomplete/english/:prefix
 *
retrieveAutocompleteEnglish(req, res) {
    let respBody = {
        results: [];
    }
    respBody.results = svc.findMatches(req.params.prefix);

    res.set('Content-Type', 'application/json');
    res.set('Content-Length', Buffer.bytelength(JSON.stringify(respBody.results), 'utf8'));
    res.send(respBody);
}
*/
