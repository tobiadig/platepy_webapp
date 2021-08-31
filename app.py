from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
import os
from datetime import datetime
import flask
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import base64
from io import BytesIO
import json
import warnings
warnings.filterwarnings("ignore")
import importlib
from shapely.geometry import Point, Polygon, LineString

from platepy import *

def concreteModuliUnitFactor(input):
    if input == '1':
        return 1e9
    elif input=='2':
        return 10e3
    elif input=='3':
        return 6,89475729

def plateThicknessUnitFactor(input):
    if input == '1':
        return 10-3
    elif input=='2':
        return 0.0254

def plateOutlineUnitFactor(input):
    if input == '1':
        return 1
    elif input=='2':
        return 0.3048

def resultsUnitFactors(inputs):
    if inputs[0] == '1':
        vDisp=1e3
    elif inputs[0]=='2':
        vDisp=39.3701
    
    if inputs[1] == '1':
        m=1
    elif inputs[1]=='2':
        m=737.562

    if inputs[2] == '1':
        v=1e3
    elif inputs[2]=='2':
        v=0.224809e3

    return vDisp, m, v

def flask_generateConcrete(inputJSON):
    ConcreteDict = {}
    ConcreteDict["eModule"] = float(inputJSON["eMod"])*concreteModuliUnitFactor(inputJSON["eModUnit"])
    ConcreteDict["gModule"] =  float(inputJSON["gMod"])*concreteModuliUnitFactor(inputJSON["gModUnit"])
    ConcreteDict["nu"] = float(inputJSON["nu"])
    modelConcrete = Concrete(ConcreteDict)
    return modelConcrete

def flask_generateLoad(inputJSON):
    loadMag = float(inputJSON["loadMag"])
    modelLoad = Load('area',np.array([loadMag, 0, 0]))
    return modelLoad

def flask_generatePlate(inputJSON, plateID):
    plateDict = {}
    plateDict["outlineCoords"] = constructOutlineCoordinates(inputJSON, "plate", plateID)*plateOutlineUnitFactor(inputJSON["plateOutlineUnit"])
    plateDict["thickness"] = float(inputJSON["plateThick"])*plateThicknessUnitFactor(inputJSON["plateThickUnit"])
    plateDict["body"] = flask_generateConcrete(inputJSON)
    modelPlate = Plate(plateDict)
    return modelPlate

def getnWallsInTheSystem(inputJSON):
    nWallsInTheSystem = 0
    wallsCounted = []
    for key in inputJSON.keys():
        if keyIsCoordinatePoint(key):
            keyInformationDic = getCoordInformation(key)
            myStructureType = keyInformationDic['structureType']
            if myStructureType == 'wall':
                elementID = keyInformationDic['elementID']
                if elementID not in wallsCounted:
                    wallsCounted.append(elementID)
                    nWallsInTheSystem +=1
    return nWallsInTheSystem

def getnColumnsInTheSystem(inputJSON):

    nColumnsInTheSystem = 0
    columnsCounted = []
    for key in inputJSON.keys():
        if keyIsCoordinatePoint(key):
            keyInformationDic = getCoordInformation(key)
            myStructureType = keyInformationDic['structureType']
            if myStructureType == 'column':
                elementID = keyInformationDic['elementID']
                if elementID not in columnsCounted:
                    columnsCounted.append(elementID)
                    nColumnsInTheSystem +=1
    return nColumnsInTheSystem

def constructBC(inputJSON, structureType, elementBC):
    # print('elementBC', elementBC)
    # print('input json: ', inputJSON)
    # supportArray = np.zeros(3, dtype=int)
    for key in inputJSON.keys():
        # print('key: ', key)
        if keyIsBC(key):
            # print(key, ' is a BC!')
            keyInformationDic = getCoordInformation(key)
            # print('key information: ',keyInformationDic)
            if (structureType == keyInformationDic['structureType']) and (elementBC==int(keyInformationDic['elementID'])):
                # print('the key is in the correct element!')
                if structureType=="wall":
                    if inputJSON[key]=='Simply supported':
                        supportArray = np.array([1,0,1])
                    elif inputJSON[key]=='Clamped':
                        supportArray = np.array([1,1,0])
                elif structureType=="column":
                    if inputJSON[key]=='Simply supported':
                        supportArray = np.array([1,0,0])
                    elif inputJSON[key]=='Clamped':
                        supportArray = np.array([1,1,1])
    return supportArray

def flask_generateWall(inputJSON, wallID):
    wallDict = {}
    wallDict["outlineCoords"] = constructOutlineCoordinates(inputJSON, "wall", wallID)
    # print('coordinates of wall ', wallID,' are ', constructOutlineCoordinates(inputJSON, "wall", wallID))
    wallDict["support"] = constructBC(inputJSON, "wall", wallID)
    # print('BC of wall ', wallID,' are ', constructBC(inputJSON, "wall", wallID))
    wallDict["thickness"] = 0.05 # m
    modelWall = Wall(wallDict)
    return modelWall

def flask_generateColumn(inputJSON, columnID):
    columnDict = {}
    columnDict["outlineCoords"] = constructOutlineCoordinates(inputJSON, "column", columnID)
    # print('coordinates of wall ', wallID,' are ', constructOutlineCoordinates(inputJSON, "wall", wallID))
    columnDict["support"] = constructBC(inputJSON, "column", columnID)
    columnDict["width"] = 0.05 # m
    # print('BC of wall ', wallID,' are ', constructBC(inputJSON, "wall", wallID))
    modelColumn = Column(columnDict)
    return modelColumn

def representsInt(s):
    try: 
        int(s)
        return True
    except ValueError:
        return False

def keyIsBC(key):
    temp = key.split('_')
    structureTypes = ['plate', 'wall', 'column']
    if temp[0] in structureTypes:
        if temp[2]=='BC':
            return True
    else:
        return False

def keyIsCoordinatePoint(key):
    temp = key.split('_')
    structureTypes = ['plate', 'wall', 'column']
    if temp[0] in structureTypes:
        if temp[2]=='PT':
            return True
    else:
        return False

def getCoordInformation(key):
    temp = key.split('_')
    keyInformationDic = {}
    keyInformationDic['structureType'] = temp[0]
    keyInformationDic['elementID'] = temp[1]
    keyInformationDic['entryType'] = temp[2]
    if temp[2]=='PT':
        keyInformationDic['axis'] = temp[3]
        keyInformationDic['nPoint'] = int(temp[4])
    elif temp[2]=='BC':
        # keyInformationDic['DOF'] = temp[3]
        pass
    return keyInformationDic

def axisStringToIndex(axisName):
    if axisName == 'x':
        return 0
    elif axisName == 'y':
        return 1
    else:
        raise TypeError('axis name not recognised')

def outlineDictToArray(outlineCoordsDic):
    outlineList = list(outlineCoordsDic.items())
    nCoords = len(outlineList)
    outlineCoordsArray=np.zeros((nCoords,2))
    for i,coord in enumerate(outlineList):
        xy = np.array(coord[1], dtype=float)
        outlineCoordsArray[i,:]=xy
    return outlineCoordsArray

def constructOutlineCoordinates(inputJSON, structureType, ID):
    # print('strucutre type: ', structureType)
    # print('ID: ', ID)
    outlineCoordsDic = {}
    for key in inputJSON.keys():
        # print('key: ', key)
        if keyIsCoordinatePoint(key):
            # print('the key is a coordinate!')
            keyInformationDic = getCoordInformation(key)
            myStructureType = keyInformationDic['structureType']
            # print('strucute type: ', myStructureType)
            myAxis = keyInformationDic['axis']
            myPoint = keyInformationDic['nPoint']
            elementID = keyInformationDic['elementID']
            # print('Id element: ', elementID)
        else:
            # print('the key is not a coordinate!')
            continue
        # print('type of myStructureType: ',type(myStructureType))
        # print('type of structureType: ',type(structureType))
        # print('type of elementID: ',type(elementID))
        # print('type of ID: ',type(ID))
        if (myStructureType !=structureType) or (int(elementID) !=ID):
            # print('the coordinate is not of the right element!')
            continue
        axisIndex = axisStringToIndex(myAxis)
        if myPoint not in outlineCoordsDic:
            # print('the coordinate is of the right element!')
            outlineCoordsDic[myPoint]=[[],[]]

        # print('point number: ', myPoint)
        # print('axisindex: ', axisIndex)

        outlineCoordsDic[myPoint][axisIndex] = inputJSON[key]
    outArray = outlineDictToArray(outlineCoordsDic)
    # print('outArray dict: ', outlineCoordsDic)
    # print('outArray: ',type(outArray) )
    return outArray

def encodeListToString(myList):
    separator = '-_-_SEPARATOR_-_-'
    finalString = ''
    for a in myList:
        finalString += (a+separator)
    return finalString[:-len(separator)]

def decodeListFromString(encodedString):
    finalList = encodedString.split('-_-_SEPARATOR_-_-')
    return finalList

def checkOutlineCoordinates(coordinatesWall, coordinatesPlate, elementName):
    line = LineString(coordinatesPlate)
    poly_path = Polygon(coordinatesPlate)
    for wallPoint  in coordinatesWall:
        p1 = Point(wallPoint)
        if line.contains(p1) and (wallPoint.tolist() not in coordinatesPlate.tolist()):
            errorMessage = "Point ({xCoord}, {yCoord}) of {name} is on the plate's boundary but does not corresponds to a plate's coordinate. Add the aforementioned coordinate to the plate's outline.".format(xCoord=wallPoint[0], yCoord=wallPoint[1], name=elementName)
            return False, errorMessage
        elif (not p1.within(poly_path)) and (not line.contains(p1) ):
            errorMessage = "Point ({xCoord}, {yCoord}) of {name} is outside of the plate's boundaries.".format(xCoord=wallPoint[0], yCoord=wallPoint[1], name=elementName)
            return False, errorMessage
    return True, ''

def checkPlateOutline(coordinatesPlate):
    if coordinatesPlate[0,:].tolist() != coordinatesPlate[-1,:].tolist():
        errorMessage = "The first and the last point of the plate's outline must be equal.".format()
        return False, errorMessage
    return True, ''


app = Flask(__name__)
SESSION_TYPE = 'filesystem'
app.secret_key = b'=T#=wRj*:Yj87p!s'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config.from_object(__name__)
Session(app)

@app.route('/postmethod', methods = ['POST'])
def get_post_javascript_data():
    jsdata = request.form['javascript_data']
    inputJSON = json.loads(jsdata)
    try:
        flaskModel = PlateModel()
        modelLoad = flask_generateLoad(inputJSON)
        flaskModel.addLoad(modelLoad)
        modelPlate = flask_generatePlate(inputJSON,1)
        areCoordinatesOK, errorMessage =checkPlateOutline(modelPlate.outlineCoords)
        if not areCoordinatesOK:
            session['serverResponseValue'] = 0
            session['result'] = errorMessage
            return 'nothing'
        flaskModel.addPlate(modelPlate)
        nWalls = getnWallsInTheSystem(inputJSON)
        wallList = []
        if nWalls > 0:
            for i in range(nWalls):
                modelWall = flask_generateWall(inputJSON,i+1)
                elementName='wall {nWall}'.format(nWall=i+1)
                # print(elementName)
                areCoordinatesOK, errorMessage =checkOutlineCoordinates(modelWall.outlineCoords, modelPlate.outlineCoords, elementName)
                if not areCoordinatesOK:
                    session['serverResponseValue'] = 0
                    session['result'] = errorMessage
                    return 'nothing'
                flaskModel.addWall(modelWall)
                wallList.append(modelWall)

        nColumns = getnColumnsInTheSystem(inputJSON)
        columnList = []
        if nColumns > 0:
            for i in range(nColumns):
                modelColumn = flask_generateColumn(inputJSON,i+1)
                elementName='Column {nColumn}'.format(nColumn=i+1)
                # print(elementName)
                areCoordinatesOK, errorMessage =checkOutlineCoordinates(modelColumn.outlineCoords, modelPlate.outlineCoords, elementName)
                if not areCoordinatesOK:
                    session['serverResponseValue'] = 0
                    session['result'] = errorMessage
                    return 'nothing'
                flaskModel.addColumn(modelColumn)
                columnList.append(modelColumn)

        # fig,axGeometry = plotInputGeometry(flaskModel, saveBase64=True)
        # fig is the base64 string! should be, at least
        try:
            nMaxElements = 1000
            generateMesh(flaskModel, maxNelements = nMaxElements)
        except:
            errorMessage = "The model has {currentElements} elements, the maximum allowed is {maxElements}. Please choose a coarser mesh.".format(currentElements=1108, maxElements=nMaxElements)
            session['serverResponseValue'] = 0
            session['result'] = errorMessage
            return 'nothing'


        userResultsUnitSelection = [inputJSON["vDispUnit"],inputJSON["mUnit"],inputJSON["vUnit"] ]
        scaleVdisp, scalem, scalev = resultsUnitFactors(userResultsUnitSelection)
        solveModel(flaskModel, resultsScales = (scaleVdisp,scalem,scalev))

        outFig, outAxis = plotResults(flaskModel, ['vDisp', 'Mx', 'My', 'Mxy', 'Vx', 'Vy'], saveBase64=True)
        meshFig, outAx= plotMesh(flaskModel, plotNodes=False, plotStrucElements=False, plotPoints=False, saveBase64=True)
        outFig.append(meshFig)
        encodedResults = encodeListToString(outFig)

        session['serverResponseValue'] = 1
        session['result'] = encodedResults

    except Exception as e:
        session['serverResponseValue'] = 0
        session['result'] = e

    return 'nothing'

@app.route('/postgeometry', methods = ['POST'])
def displayOnlyGemetry():
    jsdata = request.form['javascript_data_geometry']
    inputJSON = json.loads(jsdata)
    try:
        flaskModel = PlateModel()
        modelLoad = flask_generateLoad(inputJSON)
        flaskModel.addLoad(modelLoad)
        modelPlate = flask_generatePlate(inputJSON,1)
        areCoordinatesOK, errorMessage =checkPlateOutline(modelPlate.outlineCoords)
        if not areCoordinatesOK:
            session['serverResponseValue'] = 0
            session['result'] = errorMessage
            return 'nothing'
        flaskModel.addPlate(modelPlate)
        nWalls = getnWallsInTheSystem(inputJSON)
        wallList = []
        if nWalls > 0:
            for i in range(nWalls):
                modelWall = flask_generateWall(inputJSON,i+1)
                elementName='wall {nWall}'.format(nWall=i+1)
                # print(elementName)
                areCoordinatesOK, errorMessage =checkOutlineCoordinates(modelWall.outlineCoords, modelPlate.outlineCoords, elementName)
                if not areCoordinatesOK:
                    session['serverResponseValue'] = 0
                    session['result'] = errorMessage
                    return 'nothing'
                flaskModel.addWall(modelWall)
                wallList.append(modelWall)

        nColumns = getnColumnsInTheSystem(inputJSON)
        columnList = []
        if nColumns > 0:
            for i in range(nColumns):
                modelColumn = flask_generateColumn(inputJSON,i+1)
                elementName='Column {nColumn}'.format(nColumn=i+1)
                # print(elementName)
                areCoordinatesOK, errorMessage =checkOutlineCoordinates(modelColumn.outlineCoords, modelPlate.outlineCoords, elementName)
                if not areCoordinatesOK:
                    session['serverResponseValue'] = 0
                    session['result'] = errorMessage
                    return 'nothing'
                flaskModel.addColumn(modelColumn)
                columnList.append(modelColumn)

        outFig,axGeometry = plotInputGeometry(flaskModel, saveBase64=True)
        figList = []
        figList.append(outFig)

        encodedResults = encodeListToString(figList)

        session['serverResponseValue'] = 1
        session['result'] = encodedResults

    except Exception as e:
        raise
        session['serverResponseValue'] = 0
        session['result'] = e

    return 'nothing'


@app.route('/updateResults', methods = ['POST'])
def updateResults():
    print('UPDATING RESULTS')
    serverResponseValue = session.get('serverResponseValue')
    if serverResponseValue == 1:
        encodedResults = session.get('result')
        outFig = decodeListFromString(encodedResults)
        if len(outFig)==1:
            result = render_template('displayGeometry_model.html', resFigures=outFig)
        else:
            result = render_template('resultsSection_model.html', resFigures=outFig)
    elif serverResponseValue == 0:
        errorText = session.get('result')
        result = render_template('errorReport_model.html', resultTextFromServer=errorText)

        # print('first figure, again: ', outFig[0])
    JSONresponse = jsonify(serverResponseValue = serverResponseValue,response =  result)
        # returnDictionary = {"serverResponseValue": serverResponseValue, "result": JSONhtmlToReturn}
        # JSONToSendBack = json.dumps(returnDictionary)
        # print('JSONToSendBack', JSONhtmlToReturn)
    return JSONresponse


@app.route('/', methods = ['POST', 'GET'])
def index():
    return render_template('index.html')


# No caching at all for API endpoints.
@app.after_request
def add_header(response):
    # response.cache_control.no_store = True
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response


# if __name__=="__main__":
#     app.run(debug=True)
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))


