# coding=utf-8

import csv
from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['db-DSGC']
md = db["milestones-data"]
md.drop()

dInit = {}
mongoArr = []

with open('milestones-consolidated.txt', 'rU') as data:
    reader = csv.reader(data, skipinitialspace=False, delimiter="\t")
    mcArr = []
    for row in reader:
        if any(row):
            mcArr.append(row)
for inp in mcArr:
    if inp[0] and not (inp[0] == 'center'):
        print(inp)
        dictTot = dInit.copy()
        dictTot['center'] = inp[0]
        dictTot['assay'] = inp[1]
        dictTot['assay-info'] = inp[2]

        # cell-lines
        allCellLines = []
        clDictInit = {}

        # Format of cell line cell (from Excel):
        # name1,type1(normal or ips-differentiated),
        # class1(normal,cancer line,…)::control-or-disease,
        # tissue1;...
        # Split by ; then , to build arr of objs

        cellLineArr = inp[3].split(";")
        for cLine in cellLineArr:
            clDict = clDictInit.copy()
            cLineData = cLine.split(",")
            if len(cLineData) == 4:
                clDict['name'] = cLineData[0]
                clDict['type'] = cLineData[1]
                # Check if : in class --> For diseased (not cancer) cell lines
                if ":" in cLineData[2]:
                    classArr = cLineData[2].split(":")
                    clDict['class'] = classArr[0]
                    clDict['control-or-disease'] = classArr[1]
                else:
                    clDict['class'] = cLineData[2]
                clDict['tissue'] = cLineData[3]
                if clDict:
                    allCellLines.append(clDict)

        if allCellLines:
            dictTot['cell-lines'] = allCellLines

        # cell-lines-meta: count1,type1;count2,type2
        # Split by ; then , to build arr of objs
        cLineMetaArr = []
        cLineMetaDictInit = {}

        cLineMetaData = inp[4].split(";")
        for meta in cLineMetaData:
            print(meta)
            cLineMetaDict = cLineMetaDictInit.copy()
            cLineMeta = meta.split(",")
            if cLineMeta[0]:
                cnt = cLineMeta[0]
                cLineMetaDict['count'] = float(cnt) if '.' in cnt else int(cnt)
                if cLineMeta[1]:
                    cLineMetaDict['type'] = cLineMeta[1]
                if cLineMetaDict:
                    cLineMetaArr.append(cLineMetaDict)

        if cLineMetaArr:
            dictTot['cell-lines-meta'] = cLineMetaArr

        # perturbagens: name1,type1(,perturbagens1);name2,type2(, purturbagens2)
        # Split by ; then , to build arr of objs
        pertArr = []
        pertDictInit = {}

        pertsAll = inp[5].split(";")
        for perts in pertsAll:
            pertDict = pertDictInit.copy()
            pertData = perts.split(",")
            if pertData[0]:
                pertDict['name'] = pertData[0]
            if len(pertData) > 1:
                pertDict['type'] = pertData[1]
            # Check if has perturbagens value
            if len(pertData) == 3:
                pertDict['perturgagens'] = pertData[2]
                if pertDict:
                    pertArr.append(pertDict)

        if pertArr:
            dictTot['perturbagens'] = pertArr

        # perturbagens-meta

        pertMetaArr = []
        pertMetaDict = {}

        # pair:type1,count1;type2,count2
        # Split by : and get pair
        # Then split [1] by ; and then , to build arr of objs

        getPair = inp[6].split(":")
        if getPair[0] == "true":
            pertMetaDict['pair'] = True
        elif getPair[0] == "false":
            pertMetaDict['pair'] = False

        pertCountArr = []
        pertCountDict = {}
        if len(getPair) > 1:
            pertCountMeta = getPair[1].split(";")
            for countMeta in pertCountMeta:
                countData = countMeta.split(",")
                if countData[0]:
                    pertCountDict['type'] = countData[0]
                if countData[1]:
                    pertCountDict['count'] = int(countData[1])
                if pertCountDict:
                    pertCountArr.append(pertCountDict)

        if pertCountArr:
            pertMetaDict['count-type'] = pertCountArr

        # dose1(,dose2,...);dose-count
        doseAll = inp[7].split(";")
        pertMetaDict['dose'] = doseAll[0].split(",")
        if len(doseAll) > 1:
            pertMetaDict['dose-count'] = doseAll[1]

        # time1(,time2,...);time-unit;time-points
        pertMetaTime = inp[8].split(";")

        pertMetaDict['time'] = pertMetaTime[0].split(",")
        if len(pertMetaTime) > 1:
            pertMetaDict['time-unit'] = pertMetaTime[1]
            pertMetaDict['time-points'] = pertMetaTime[2]

        if pertMetaDict:
            dictTot['perturbagens-meta'] = pertMetaDict

        # instance-meta: reps,tech-reps
        instanceMetaDict = {}

        reps = inp[9].split(",")
        if len(reps) == 2:
            instanceMetaDict['reps'] = int(reps[0])
            instanceMetaDict['tech-reps'] = int(reps[1])

        # instance-meta map: pert1,cell-line1;pert2,cell-line2
        mapArr = []
        mapDictInit = {}

        if inp[10] == "one-all":
            for pertObj in pertArr:
                if 'name' in pertObj:
                    for cLineObj in allCellLines:
                        mapDict = mapDictInit.copy()
                        mapDict['perturbagen'] = pertObj['name']
                        mapDict['cell-line'] = cLineObj['name']
                        mapArr.append(mapDict)
        else:
            allMaps = inp[10].split(";")
            for mapData in allMaps:
                mapDict = mapDictInit.copy()
                maps = mapData.split(",")
                if len(maps) == 2:
                    mapDict['perturbagen'] = maps[0]
                    mapDict['cell-line'] = maps[1]
                    if mapDict:
                        mapArr.append(mapDict)

        instanceMetaDict['map'] = mapArr

        if instanceMetaDict:
            dictTot['instance-meta'] = instanceMetaDict

        # readouts -> name1:datatype1;name2:datatype2
        readoutsArr = []
        readoutsDictInit = {}

        allReadouts = inp[11].split(";")
        for readout in allReadouts:
            readoutDict = readoutsDictInit.copy()
            readoutData = readout.split(":")
            if readoutData[0]:
                readoutDict['name'] = readoutData[0]
            if len(readoutData) == 2:
                readoutDict['datatype'] = readoutData[1]
            if readoutDict:
                readoutsArr.append(readoutDict)

        if readoutsArr:
            dictTot['readouts'] = readoutsArr

        # readout-count
        if inp[12]:
            dictTot['readout-count'] = inp[12]

        # Data release dates
        dateArr = []
        if inp[13]:
            lvlOneDate = datetime.strptime(inp[13], '%Y %m %d')
            lvlOne = {
                'date': lvlOneDate,
                'release-level': 1
            }
            dateArr.append(lvlOne)

        if inp[14]:
            lvlTwoDate = datetime.strptime(inp[14], '%Y %m %d')
            lvlTwo = {
                'date': lvlOneDate,
                'release-level': 1
            }
            dateArr.append(lvlTwo)

        if inp[15]:
            lvlThreeDate = datetime.strptime(inp[15], '%Y %m %d')
            lvlThree = {
                'date': lvlOneDate,
                'release-level': 1
            }
            dateArr.append(lvlThree)

        if inp[16]:
            lvlFourDate = datetime.strptime(inp[16], '%Y %m %d')
            lvlFour = {
                'date': lvlOneDate,
                'release-level': 1
            }
            dateArr.append(lvlFour)

        if dateArr:
            dictTot['release-dates'] = dateArr

        md.insert(dictTot)
        print(dictTot)
# print(dictTot)
