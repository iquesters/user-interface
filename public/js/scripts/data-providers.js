/**
 * This function provide you the form schema based on formID
 * 
 * @param string formID
 * 
 * @return json formSchema 
 */
async function getFormSchema(formID) {
    let formSchema = await fetch('/api/noauth/form/'+formID)
        .then(response => response.json())
        .catch(err => console.log(err))
    
    return formSchema?.data;
}

/**
* This function provide you the table schema based on tableID
* 
* @param string tableID
* 
* @return json formSchema 
*/
async function getTableSchema(tableID) {
   let tableSchema = await fetch('/api/noauth/table/'+tableID)
       .then(response => response.json())
       .catch(err => console.log(err))
   
   return tableSchema?.data;
}