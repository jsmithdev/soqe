module.exports = main_view()


function main_view() {
    return /* html */`
    <html>
    
    <style>
        div {
            text-align: center;
            padding: 5px;
          }
        div.editor {
            padding-top: 1rem;
        }
        textarea {
            width: 80%;
            height: 15rem;
            text-align: left;
        }
        button {
            cursor: pointer;
            margin: .8rem;
            border-radius: 5px;
        }
        table {
            table-layout: fixed;
            width: 100%;
        }
        svg {
            bottom: 0;
            width: 70px;
            height: 70px;
            cursor: pointer;
            line-height: 1rem;
        }
        svg#back {
            float: left;
        }
        svg#forward {
            float: right;
        }
    </style>
    
    <body>
    
        <div class="editor">
            <textarea
                autocomplete="on"
                id="soql"
            >select id, name, account.name, account.createdby.name from contact limit 2</textarea>
        </div>
    
        <div>
            <svg id="back" viewBox="0 0 24 24">
                <path fill="#ec00ff" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
            </svg>
            <button 
                type="button" 
                id="query">
                  Query
            </button>
            |
            <button 
                type="button" 
                id="querySave">
                  Query & Save
            </button>
            |
            <button 
                type="button" 
                id="deleteStored">
                  Delete Stored
            </button>
            <svg id="forward" viewBox="0 0 24 24">
                <path fill="#ec00ff" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
        </div>
    
        <div style="border-bottom: 2px solid #ec00ff; padding: 5px"></div>
    
        <div>
            <b>Total Size: </b><span id="current_totalSize"></span>
        </div>
        <div>
            <b>Current timestamp: </b>
            <span id="current_timestamp"></span>
        </div>
        <div>
            <b>Current Query: </b>
            <span id="current_query"></span>
        </div>
        <div id="results">
            <table>
                <thead></thead>
                <tbody></tbody>
            </table>
        </div>
    </body>
    
    <script>
    
    const vscode = acquireVsCodeApi()
    
    const dom = {
        current_query: document.getElementById('current_query'),
        current_timestamp: document.getElementById('current_timestamp'),
        results: document.getElementById('results'),
        soql: document.getElementById('soql'),
        back: document.getElementById('back'),
        query: document.getElementById('query'),
        querySave: document.getElementById('querySave'),
        deleteStored: document.getElementById('deleteStored'),
        forward: document.getElementById('forward'),
        current_totalSize: document.getElementById('current_totalSize'),
        thead: document.querySelector('thead'),
        tbody: document.querySelector('tbody'),
    }
    
    const cache = {
        get query(){
            return this._query
        },
        set query(new_query){
            this._query = new_query
            dom.current_query.textContent = new_query
        },
        get totalSize(){
            return this._totalSize
        },
        set totalSize(totalSize){
            this._totalSize = totalSize
            dom.current_totalSize.textContent = totalSize
        },
        get timestamp(){
            return this._current_timestamp
        },
        set timestamp(value){
            this._current_timestamp = value
            dom.current_timestamp.textContent = value
        },
    }
    
    
    
    dom.query.onclick = event => executeQuery(dom.soql.value)
    dom.querySave.onclick = event => executeQuerySave(dom.soql.value)
    dom.deleteStored.onclick = event => deleteStored()
    dom.back.onclick = event => back()
    dom.forward.onclick = event => forward()
    
    function back(){
        
        vscode.postMessage({ 
            type: 'back', 
            timestamp: cache.timestamp,
        })
    }
    function forward(){
        
        vscode.postMessage({ 
            type: 'forward', 
            timestamp: cache.timestamp,
        })
    }
    
    window.addEventListener('message', event => {
    
        const { data } = event
    
    
        const {
            done,
            columns,
            records,
            totalSize,
            timestamp,
            query,
        } = data;
    
    
        cache.totalSize = totalSize
        cache.timestamp = timestamp
        cache.query = query
    
        setupTable( records, columns )
    })
    
    
    function executeQuery(query) {
    
        cache.query = query
    
        vscode.postMessage({ 
            type: 'query', 
            query,
        })
    }
    function executeQuerySave(query) {
    
        cache.query = query
    
        vscode.postMessage({ 
            type: 'query', 
            store: true, 
            query,
        })
    }
    function deleteStored() {
    
        vscode.postMessage({ 
            type: 'delete_all',
        })
    }
    
    
    function setupTable(records, columns){
    
        clearTable()
    
        columns.map(col => {
            
            const th = document.createElement('th')
            th.textContent = col
            dom.thead.appendChild(th)	
        })
    
        records.map(record => {
    
            const tr = document.createElement('tr')
    
            const values = columns.map(key => getValue(key, record))
    
            values.map(value => {
                tr.appendChild( mkTD( value ))
            })
            
            dom.tbody.appendChild(tr)
        })
    }
    
    function mkTD(value){
                        
        const td = document.createElement('td')
        td.textContent = value
        return td
    }
    function getValue(key, record){
        
        if( record[key] ){
            return record[key]
        }
    
        const data = key.split('.')
    
        // nested child
        if(data.length === 2){
            return record[ data[0] ][ data[1] ]
        }
        // nested nested child
        if(data.length === 3){
            return record[ data[0] ][ data[1] ][ data[2] ]
        }
        // nested nested child
        if(data.length === 4){
            return record[ data[0] ][ data[1] ][ data[2] ][ data[3] ]
        }
    }
    
    function flatten_values(obj){
    
        return Object.values(obj).reduce((acc, value) => {
            
            if(typeof value !== 'object'){
                return [...acc, value]
            }
            else {
                return [...acc, ...flatten_values(value)]
            }
        }, []);
    }
    
    
    function clearTable(){
        
        while (dom.thead.lastElementChild) {
            dom.thead.removeChild(dom.thead.lastElementChild);
        }
        while (dom.tbody.lastElementChild) {
            dom.tbody.removeChild(dom.tbody.lastElementChild);
        }
        return undefined
    }
    
    </script>
    </html>
    `
    }