
function myFunction(mySrc) {
  // Get the expanded image
  var expandImg = document.getElementById("expandedImg");

  // Use the same src in the expanded image as the image being clicked on from the grid
  expandImg.src = "data:image/png;base64, "+mySrc;

  // Show the container element (hidden with CSS)
  expandImg.parentElement.style.display = "block";
}

function addRow(myTable, elemType){
  var table = document.getElementById(myTable);
  var totalRowCount = table.rows.length;
  var row = table.insertRow(totalRowCount-1);

  // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

  // Add some text to the new cells:
  var n1 =(totalRowCount-1).toString();
  var n2 =(totalRowCount).toString();

  cell1.innerHTML = (totalRowCount-1).toString()+': ';
  cell2.innerHTML = '<input  type="text" name="'+elemType+'x'+ n1 +'">';
  cell3.innerHTML = '<input  type="text" name="'+elemType+'y'+ n1 +'">';
}

var wallList = [];
var colList = [];

function createBCbutton(stringOfTheButton, nElement, elementType){
  var textnode = document.createTextNode(stringOfTheButton);
  newP = document.createElement("p");
  newLabel = document.createElement("label");
  newInput = document.createElement("input");
  newSpan = document.createElement("span");
  // newInput.setAttribute("size", "1px");
  newInput.setAttribute("type", "radio");
  // newInput.setAttribute("class", "filled-in");
  newInput.setAttribute("name", elementType+"_"+nElement.toString()+"_BC")
  newInput.setAttribute("class","with-gap")

  // newInput.setAttribute("GroupName","radio");["Simply supported", "Clamped"];
  if (stringOfTheButton == 'Simply supported'){
    newInput.setAttribute("value","0");
  }else{
    newInput.setAttribute("value","1");
  }
  newLabel.appendChild(newInput);
  newSpan.appendChild(textnode);
  newSpan.setAttribute("class", "notWrappable")
  newLabel.appendChild(newSpan);
  newP.appendChild(newLabel);
  return newP
}

function addOutlineCoordinateToTable(tableID, xValue="", yValue=""){
  var splittedID = tableID.split("_");
  var elemType = splittedID[0];
  var elemNumber = splittedID[1];

  var table = document.getElementById(tableID);
  var totalRowCount = table.rows.length;
  if(elemType=='wall'){
    totalRowCount = totalRowCount-2;
  };
  var tr = createOutlineTableCoord(nPoint=totalRowCount, withButtons=true, elemID=tableID, xValue, yValue);
  table.appendChild(tr);
}

function createOutlineTableTitle(withButtons, elemID){
  var splittedID = elemID.split("_");
  var elemType = splittedID[0];
  var elemNumber = splittedID[1];
  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.setAttribute("class","centeredRow");
  let th1 = th.cloneNode();
  let th2 = th.cloneNode();
  let th3 = th.cloneNode();
  let th4 = th.cloneNode();
  th1.appendChild(document.createTextNode("Point"));
  th2.appendChild(document.createTextNode("x"));
  th3.appendChild(document.createTextNode("y"));
  var a = document.createElement("a");
  a.setAttribute("class", "btn-floating btn-large waves-effect waves-light white");
  a.setAttribute("onclick","addOutlineCoordinateToTable('"+elemID+"');")
  
  var i = document.createElement("i");
  i.setAttribute("class", "material-icons");
  i.appendChild(document.createTextNode("add"));
  
  a.appendChild(i);
  
  if (withButtons){
    th4.appendChild(a);
  }
  
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tr.appendChild(th4);
  return tr
}
function createOutlineTableCoord(nPoint, withButtons, elemID, xValue, yValue){
  var splittedID = elemID.split("_");
  var elemType = splittedID[0];
  var elemNumber = splittedID[1];

  var tr = document.createElement('tr');
  var th = document.createElement('th');
  th.setAttribute("class","centeredRow");
  let th1 = th.cloneNode();
  let th2 = th.cloneNode();
  let th3 = th.cloneNode();
  let th4 = th.cloneNode();
  var a = document.createElement("a");
  var i = document.createElement("i");
  
  a.setAttribute("class", "btn-floating btn-large waves-effect waves-light white");
  a.setAttribute("onclick", "$(this).closest('tr').remove();");
  i.setAttribute("class", "material-icons");
  i.appendChild(document.createTextNode("clear"));
  a.appendChild(i);
  if (withButtons){
    th4.appendChild(a);
  }
  
  var input = document.createElement('input');
  input.setAttribute("type", "text");
  input.setAttribute("pattern","\d*")
  input1 = input.cloneNode()
  input2 = input.cloneNode()
  input1.setAttribute("name", elemType+"_"+elemNumber.toString()+"_PT_"+"x"+"_"+nPoint.toString())
  input1.setAttribute("value", xValue)
  input2.setAttribute("name", elemType+"_"+elemNumber.toString()+"_PT_"+"y"+"_"+nPoint.toString())
  input2.setAttribute("value", yValue)

  th1.appendChild(document.createTextNode(nPoint));
  th2.appendChild(input1);
  th3.appendChild(input2);
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tr.appendChild(th4);
  return tr
}

function addTab(tabString){
  lastElement = document.getElementById("lastTabElement");
  newLi = document.createElement("li");
  newLi.setAttribute("class","tab col s3" )
  deleteButton = document.createElement('i');
  deleteButton.setAttribute('class', "material-icons");
  deleteButton.setAttribute('onclick', "$(this).closest('li').remove(); var myObj = document.getElementById('"+tabString+"');myObj.remove();wallList.pop(-1);");
  deleteButton.appendChild(document.createTextNode('clear'));
  a = document.createElement("a");
  a.setAttribute("href", "#"+tabString);
  a.appendChild(document.createTextNode(tabString));
  a.appendChild(deleteButton)
  // <i class="material-icons" onclick="$(this).closest('li').remove();">clear</i>
  newLi.appendChild(a);

  tabList = document.getElementById("componentTabs");
  tabList.insertBefore(newLi, lastElement);
}

const DOFsNames = ["Simply supported", "Clamped"];

function addWall(){
  nWall = wallList.length + 1;
  wallID = "wall_"+nWall.toString()+"_TBL";
  newWallString = "wall"+nWall.toString();
  wallList.push(newWallString);
  addTab(newWallString);
  tabDivs = document.getElementById("tabDivs");
  var divs = tabDivs.getElementsByClassName('col s12');
  // for (var i = 1; i < divs.length; i += 1) {
  //   divs[i].setAttribute("style", "display: none;");
  // }
  newDiv = document.createElement("div");
  newDiv.setAttribute("id", newWallString);
  newDiv.setAttribute("class","col s12");
  // newDiv.setAttribute("style", "display: block;");
  var newTable = document.createElement("table");
  newTable.setAttribute("ID",wallID)
  // var tblBody = document.createElement("tbody");

  // var tableToExpand = document.getElementById("tblBC1");
  for (var i = 0; i < 5; i++) {
    if (i<2){
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      elementType = "wall"
      var newCheckBox = createBCbutton(DOFsNames[i], nWall, elementType);
      td.appendChild(newCheckBox);
      tr.appendChild(td);
    }else if(i==2){
      tr = createOutlineTableTitle(true, wallID);
    }else{
      tr = createOutlineTableCoord(i-2, true, wallID);
    }
    // tblBody.appendChild(tr);
    newTable.appendChild(tr);
  }

  // newTable.appendChild(tblBody);
  newDiv.appendChild(newTable);
  tabDivs.appendChild(newDiv);
  return newWallString
}

function addColumn(){
  nCol = colList.length + 1;
  colID = "column_"+nCol.toString()+"_TBL";
  newColString = "column"+nCol.toString();
  colList.push(newColString);
  addTab(newColString);
  tabDivs = document.getElementById("tabDivs");
  newDiv = document.createElement("div");
  newDiv.setAttribute("id", newColString);
  newDiv.setAttribute("class","col s12");
  newDiv.setAttribute("style", "display: none;");
  var newTable = document.createElement("table");
  // var tblBody = document.createElement("tbody");

  // var tableToExpand = document.getElementById("tblBC1");
  for (var i = 0; i < 4; i++) {
    if (i<2){
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      elementType = "column"
      var newCheckBox = createBCbutton(DOFsNames[i], nCol, elementType);
      td.appendChild(newCheckBox);
      tr.appendChild(td);
    }else if(i==2){
      tr = createOutlineTableTitle(false, colID);
    }else{
      tr = createOutlineTableCoord(i-2, false, colID);
    }
    newTable.appendChild(tr);
  }
  // newTable.appendChild(tblBody);
  newDiv.appendChild(newTable);
  tabDivs.appendChild(newDiv);
}

function getFormData(whatsNext){
  notVerifiedInputs = {}
  const formData = new FormData(document.querySelector('form'))
  for (var pair of formData.entries()) {
    notVerifiedInputs[pair[0]] = pair[1]
  }
  res = validateInput(notVerifiedInputs)
  isInputValid = res[0]
  validatedInput = res[1]
  errorMessage = res[2]
  if (!isInputValid){
    alert(errorMessage)
  }

  verifiedInputs = correctBoundaryConditions(notVerifiedInputs);  // mh? 
  // console.log(verifiedInputs)

  if(whatsNext=="computeModel"){
  sendDataToServer(verifiedInputs);
  }else if(whatsNext=="displyGeometry"){
    sendDataToServerForGeometry(verifiedInputs);
  }
}

function correctBoundaryConditions(notVerifiedInputs){
  for (inputKey in notVerifiedInputs){
    // console.log(inputKey)
    inputValue = notVerifiedInputs[inputKey]
    // console.log(inputValue)
    if (inputKeyIsBoundaryCondition(inputKey)){
      // console.log(inputKey);
      // console.log(inputValue);
      var radios = document.getElementsByName(inputKey);
      for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
          if(radios[i].value=='0'){
            notVerifiedInputs[inputKey] = 'Simply supported';
          }else{
            notVerifiedInputs[inputKey] = 'Clamped';
          }

          break;
        }
      }

    }
  }
  // console.log(notVerifiedInputs);
  return notVerifiedInputs

}
function validateInput(notVerifiedInputs){
  for (inputKey in notVerifiedInputs){
    // console.log(inputKey)
    inputValue = notVerifiedInputs[inputKey]
    // console.log(inputValue)

    // console.log(isThereNoInput(inputValue))
    if (isThereNoInput(inputValue)){
      isInputValid = false
      validatedInput = 0
      errorMessage = inputKey+' has no input!'
      return [isInputValid, validatedInput, errorMessage]
    }

    if (!isInputAFloat(inputValue)){
      isInputValid = false
      validatedInput = 0
      errorMessage = inputKey+' has not a valid numerical entry!'
      return [isInputValid, validatedInput, errorMessage]
    }

  }
    isInputValid = true
    validatedInput = notVerifiedInputs
    errorMessage = ''
    return [isInputValid, validatedInput, errorMessage]
}

function inputKeyIsBoundaryCondition(inputKey){
  splittedList = inputKey.split('_');
  if(splittedList.length > 1){
    if(splittedList[2]=='BC'){
      return true
    }
  }
  return false
}

function isThereNoInput(inputValue){
  // console.log(inputValue)
  if (inputValue.length==0){
    return true
  }else{
    return false
  }
}

function isInputAFloat(inputValue){
  if (inputValue!="on"){
    a = parseFloat(inputValue)
    return !Number.isNaN(a)
  }else{
    return true
  }
}

function sendDataToServer(data){
  var loaderCircle = document.getElementById("computationLoader");
  loaderCircle.setAttribute("style", "display: visible;")
  stringifiedData = JSON.stringify(data)
  console.log(stringifiedData)
  // $.post( "/postmethod", {
  //   javascript_data: stringifiedData 
  // });
  $.ajax({
    type: "POST",
    url: "/postmethod",
    data: {javascript_data: stringifiedData},
    success: function() {
      getServerResponse();
    } ,
    error: function() {
      timeoutErrorMessage();
    } ,
    timeout: 10000
  });
}

function sendDataToServerForGeometry(data){
  var loaderCircle = document.getElementById("computationLoader");
  loaderCircle.setAttribute("style", "display: visible;")
  stringifiedData = JSON.stringify(data)
  $.ajax({
    type: "POST",
    url: "/postgeometry",
    data: {javascript_data_geometry: stringifiedData},
    success: function() {
      getGeometryServerResponse();
    } ,
    error: function() {
      timeoutErrorMessage();
    } ,
    timeout: 10000
  });
}

function timeoutErrorMessage(){
  DOMdata = '<div class = "resultsSection" id="resultsSection"><div class = "errorMessage"> Timeout error! Try refreshing the page or try later.'
  replaceResults(DOMdata)
}

function getServerResponse(){
  $.ajax({
    url: "/updateResults",
    type: "POST",
    dataType: "json",
    success: function(data){
      if(data["serverResponseValue"]==1){
        replaceResults(data["response"]);
      } else if (data["serverResponseValue"]==0){
        replaceResults(data["response"]);
      }
    }
  });
}

function getGeometryServerResponse(){
  $.ajax({
    url: "/updateResults",
    type: "POST",
    dataType: "json",
    success: function(data){
      if(data["serverResponseValue"]==1){
        replaceResults(data["response"]);
      } else if (data["serverResponseValue"]==0){
        replaceResults(data["response"]);
      }
    }
  });
}


function replaceResults(data){
  $(resultsSection).replaceWith(data)
  var loaderCircle = document.getElementById("computationLoader");
  loaderCircle.setAttribute("style", "display: none;")
}

function validateForm() {
  var x = document.forms["mainForm"]["eMod"].value;
  if (x == "") {
    alert("Name must be filled out");
    return false;
  }

}

var jsSsPlate={"loadMag":"-1","loadMagUnit":"1","eMod":"32","eModUnit":"1","gMod":"14",
"gModUnit":"1","nu":"0.17","plateThick":"0.1","plateThickUnit":"1","plateOutlineUnit":"1",
"plate_1_PT_x_1":"0","plate_1_PT_y_1":"0","plate_1_PT_x_2":"1","plate_1_PT_y_2":"0","plate_1_PT_x_3":"1",
"plate_1_PT_y_3":"1","plate_1_PT_x_4":"0","plate_1_PT_y_4":"1","plate_1_PT_x_5":"0","plate_1_PT_y_5":"0",
"wall_1_BC":"Clamped","wall_1_PT_x_1":"0","wall_1_PT_y_1":"0","wall_1_PT_x_2":"1","wall_1_PT_y_2":"0",
"wall_1_PT_x_3":"1","wall_1_PT_y_3":"1","wall_1_PT_x_4":"0","wall_1_PT_y_4":"1","wall_1_PT_x_5":"0",
"wall_1_PT_y_5":"0","vDispUnit":"1","mUnit":"1","vUnit":"1"};
var templateModelsList = [jsSsPlate,jsSsPlate];
function updateUIfromJSON(nModel){
  jsModel = templateModelsList[nModel];
  updateLoadMaterialfromJSON(jsModel);
  updatePlatefromJSON(jsModel);
}

function updateLoadMaterialfromJSON(jsModel){
  $('input[name="loadMag"]').val(jsModel["loadMag"]);
  $('input[name="eMod"]').val(jsModel["eMod"]);
  $('input[name="gMod"]').val(jsModel["gMod"]);
  $('input[name="nu"]').val(jsModel["nu"]);
}

function updatePlatefromJSON(jsModel){
  $('input[name="plateThick"]').val(jsModel["plateThick"]);
  nCoordinates = 5;
  platePoints = []
  plateCoordinates = []
  outlineCoordsDic = constructOutlineCoordinates(jsModel, structureType = "plate", ID="1")
  listOfPoints = Object.keys(outlineCoordsDic)
  // console.log(outlineCoordsDic)
  for (var i = 1; i < listOfPoints.length+1; i++) {
    coordArray = outlineCoordsDic[i]
    // console.log(coordArray[0])
    

    addOutlineCoordinateToTable("plate_1_OC",coordArray[0], coordArray[1]);
  }
}

// function outlineDictToArray(outlineCoordsDic){
//   outlineList = list(outlineCoordsDic.items())
//   nCoords = len(outlineList)
//   outlineCoordsArray=np.zeros((nCoords,2))
//   for (let i=0; i < outlineList.length; i++){
//     coord = outlineList[i];
//     xy = np.array(coord[1], dtype=float)
//     // outlineCoordsArray[i,:]=xy
//   }
//   return outlineCoordsArray
// }


function keyIsCoordinatePoint(key){
    temp = key.split('_')
    structureTypes = ['plate', 'wall', 'column']
    if (structureTypes.includes(temp[0])){
      if (temp[2]=='PT'){
        return true
      }
      else{
        return false
      }
    }
}

function axisStringToIndex(axisName){
    if (axisName == 'x') {
      return 0
    } else if (axisName == 'y'){
      return 1
    }
}

function getCoordInformation(key){
    temp = key.split('_')
    keyInformationDic = {}
    keyInformationDic['structureType'] = temp[0]
    keyInformationDic['elementID'] = temp[1]
    keyInformationDic['entryType'] = temp[2]
    if (temp[2]=='PT'){
      keyInformationDic['axis'] = temp[3]
      keyInformationDic['nPoint'] = parseInt(temp[4])
    } else if (temp[2]=='BC'){

    }
    return keyInformationDic
}


function constructOutlineCoordinates(inputJSON, structureType, ID){
  outlineCoordsDic = {};
  listOfKeys = Object.keys(inputJSON)
  for (let i=0; i < listOfKeys.length; i++){
    key = listOfKeys[i]
    if (keyIsCoordinatePoint(key)){
      keyInformationDic = getCoordInformation(key)
      myStructureType = keyInformationDic['structureType']
      myAxis = keyInformationDic['axis']
      myPoint = keyInformationDic['nPoint']
      elementID = keyInformationDic['elementID']
    }else continue

    if ((myStructureType !=structureType) || (parseInt(elementID) !=ID)){
      continue
    }
    axisIndex = axisStringToIndex(myAxis)
    if (!(myPoint in outlineCoordsDic)){
      outlineCoordsDic[myPoint]=["",""]
    }
    outlineCoordsDic[myPoint][axisIndex] = inputJSON[key]
    // console.log(outlineCoordsDic)
  }

  // outArray = outlineDictToArray(outlineCoordsDic)
  return outlineCoordsDic
}
