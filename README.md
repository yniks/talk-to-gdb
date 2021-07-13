# talk-to-gdb
Simple, yet powerful tool to control and communicate with GDB in nodejs. gdb-api

### What does this library enable?
- built in parsing
- `pattern` based message filter

# Usage
```javascript
/*** Get a GDB/MI instance ***/
const {init}=require('./')

const debuggee='./a.out'

//optinally,pass a debuggee
const gdb=await init(debuggee)

/*** Listen for any message with a pattern ***/
var pattern={
token:(token)=>token===undefined||token<30,
'class':'done'
}
var outstream=gdb.onmessage(pattern)
//stream will get all `done` messages with a token. less then 30 or undefined


/*** Listen to All messages ***/
//outstream is a nodejs stream
var outstream=gdb.onmessage(/**/)


/*** Listen to console output **/
var outstream=gdb.onmessage({'stream-type':'console-stream-output'})

/*** Listen to log output  **/
var outstream=gdb.onmessage({'stream-type':'log-stream-output'})

/*** Listen to all of async type **/
var outstream=gdb.onmessage({'async-type':(a)=>a!==undefined})

.
.
.


```
## DEBUG
- `DEBUG=msgstream:*` all logs at important points in stream pipelining
- `DEBUG=msgstream:error`
- `DEBUG=msgstream:counter`
- `DEBUG=msgstream:matcher`
- `DEBUG=msgstream:selfdestruct`

## References
- How do this library parses messages? It uses [yniks/gdb-mi-output-parser](https://github.com/yniks/gdb-mi-output-parser).
- Where to find information about GDB/MI message type,class etc ? refer [README.md of above mentioned repo](https://github.com/yniks/gdb-mi-output-parser/blob/master/Readme.md).
- Message pattern matching ? It uses  [yniks/object-pattern-match](https://github.com/yniks/object-pattern-match).
