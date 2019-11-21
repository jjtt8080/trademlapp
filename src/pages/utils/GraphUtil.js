/*this normalized the data from finn_api
 {
   h:[],
   l:[].
   o:[].
   c:[].
   t: [].
 }
 to
{
  [{x:new Date{,,,}, open: , close, high, low},
  {x:new Date{,,,}, open: , close, high, low}]
}
 */
 const label_data = [
 {
   type: "string",
   id: "Date"
 },
 {
   type: "number",
   label: "low"
 },
 {
   type: "number",
   label: "open"
 },
 {
   type: "number",
   label: "close"
 },
 {
   type: "number",
   label: "high"
 }
]
function ConvertData(input, resolution) {

    if (input === '' || input === undefined) {
      console.log("bad format of input")
      return;
    }
    console.log("input before parse: ", input)
    var inputObj = JSON.parse(input);
    console.log("input after parse", inputObj)
    var high_array = inputObj["h"]
    console.log("high_array", high_array)
    var low_array = inputObj["l"];
    var close_array = inputObj["c"];
    var open_array = inputObj["o"];
    var time_array = inputObj["t"];
    var data = [];
    data[0] = label_data;
     // First make sure status is ok
     for (var i = 0; i < high_array.length; ++i) {
          var t = time_array[i];
          var dateO = new Date(t*1000);
          console.log("dateO", dateO);
          var d = '';
          if (resolution === 'M') {
            d = (dateO.getYear() +1900)+ '/' + (dateO.getMonth()+1) + '/' +  dateO.getDate();
          }
          else if (resolution === 'D' || resolution === 'W') {
            d = (dateO.getMonth()+1) + '/' +  dateO.getDate();
          }else {
            d = (dateO.getHours()) + ':' + dateO.getMinutes();
          }
          var tooltips = 'low:' + low_array[i] + ',high:' + high_array[i] +
            ',open:' + open_array[i] + ',close:' + close_array[i];
          data[i+1] =
            [ d,
             low_array[i],
             open_array[i],
             close_array[i],
             high_array[i]];
     }
     console.log("return result", data)
     return {data};

}

export {ConvertData};
