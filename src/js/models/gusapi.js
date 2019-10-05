import { population } from '../data/population';
import { area } from '../data/area';
import { popDensity } from '../data/popDensity';
import collection from 'lodash'


export default class GusApi{
    constructor(){
        //create objects for gusVars
        this.firstVar = {}; //object for all data connected with population basic
        this.secondVar = {}; //object for all data connected with population basic
        this.versusBarChartConfig = {} //configuration of first chart

        //region names - short and long
        this.regionsNames = {
            regionLongNames: ["OPOLSKIE", "LUBUSKIE", "PODLASKIE", "ŚWIĘTOKRZYSKIE", "WARMIŃSKO-MAZURSKIE", "ZACHODNIOPOMORSKIE", "KUJAWSKO-POMORSKIE", "LUBELSKIE", "PODKARPACKIE", "POMORSKIE", "ŁÓDZKIE", "DOLNOŚLĄSKIE", "MAŁOPOLSKIE", "WIELKOPOLSKIE", "ŚLĄSKIE", "MAZOWIECKIE"],
            regionShortnames: ["OPOL", "LUBS", "PODL","ŚK","W-M","Z-P","K-P","LUBL","PODK","POMO","ŁDKZ","DŚLK","MAŁP","WIEP","ŚLSK","MAZO"]
        }

        //list of gusVars
        this.dataSource = {
            population: {
                name: 'Ludność ogółem',
                shortName: 'Ludność',
                rawData: population.results
            },
            area: {
                name: "Powierzchnia w km2",
                shortName: "Powierzchnia",
                rawData: area.results
            }
        }

        //https://bdl.stat.gov.pl/api/v1/data/by-variable/72305?format=json&unit-level=2&page-size=16 //population
        //https://bdl.stat.gov.pl/api/v1/data/by-variable/2018?format=json&unit-level=2&page-size=100 //area
        //https://bdl.stat.gov.pl/api/v1/data/by-variable/60559?format=xml&unit-level=2&page-size=100 //gęstość zaludnienia

        
    }

    changeDateToThous(arr){
        //reduce values to thousands
        const dividedArr = [];
        const divider = 1000;

        arr.forEach((value) => {
            dividedArr.push(value/divider); 
        });

        return dividedArr
    }


    //SORT TWO DATA
    sortData(arrLabels, arrDataOne, arrDataTwo, arrDataThree, bySort="one"){
    
        //create object from two arrays
        let arrayOfObj = arrLabels.map(function(d, i) {
            return {
              labels: d,
              valuesOne: arrDataOne[i] || 0,
              valuesTwo: arrDataTwo[i] || 0,
              valuesCombined: arrDataThree[i] || 0
            };
          });
      
        let sortedArrayOfObj
        //sort obj with lodash library
        if(bySort === "first"){
          sortedArrayOfObj = collection.sortBy(arrayOfObj, ['valuesOne']);
        };
        if(bySort === "second"){
          sortedArrayOfObj = collection.sortBy(arrayOfObj, ['valuesTwo']);
        };
        if(bySort === "combined"){
          sortedArrayOfObj = collection.sortBy(arrayOfObj, ['valuesCombined']);
        }

        
        //back two arrays, now sorted first create arrays
        let labels = [];
        let valuesOne = [];
        let valuesTwo = [];
        let valuesCombined = [];

        //second push data to those arrays
        sortedArrayOfObj.forEach(function(d){
            labels.push(d.labels);
            valuesOne.push(d.valuesOne);
            valuesTwo.push(d.valuesTwo);
            valuesCombined.push(d.valuesCombined);
          });
      
        //return data as object with two arrays
        return {labels, valuesOne, valuesTwo, valuesCombined}
    }

    
    //GET DATA FROM API RIGHT NOW FOR TESTING PURPOSE FROM JS FILE !!!!!!!!!!!!!!!!!!!!!!1
    getRawData(cat, numVar){ 

        //1. save data regarding gusVar to 
        this[numVar] = this.dataSource[cat] ; //set object for data

        //2. check and save range for data
        const min =  parseInt(this[numVar].rawData[0].values[0].year); //find higher year
        const max =  parseInt(this[numVar].rawData[0].values[this[numVar].rawData[0].values.length - 1].year); //find lower year
        this[numVar].yearRange = {min, max}

    };

    //transform raw data into data from one year
    getTranformData(numVar){

        //two arrays for chart (labels, and data)
        let labels = []
        let values = []
        
        this[numVar].rawData.forEach((region) => {
            //get labels for every region
            labels.push(region.name); 

            //get data for each region for current year with destructuring 
            region.values.forEach(({ year, val }) => {
                if(parseInt(year) == this.versusBarChartConfig.currentYear){
                    values.push(val);
                }
            })
        });

        // //save data to class and sorted by labels
        this[numVar].transformedData = { labels, values }  
    }


    //create data which will be injected into chart.js
    getChartData(bySort='first'){
        //bySort: one, two. by which gusVar sort data 

        //1. SET SORT OPTION TO STATE ONLY FOR FIRST AND SECOND GUSVAR
        if(bySort !== "combined"){
            this.versusBarChartConfig.versusSort = bySort;
        }

        //2. GET COBMINED DATA FROM GUSVARS
        const combinedData = [];
        this.firstVar.transformedData.values.forEach( (value, index) => {
            const combinedValue = Math.round(value / this.secondVar.transformedData.values[index]);
            combinedData.push(combinedValue);
        });

        //3. SORT BY SELECTED DATA
        const sortedData = this.sortData(
            this.firstVar.transformedData.labels, 
            this.firstVar.transformedData.values, 
            this.secondVar.transformedData.values, 
            combinedData,
            bySort)
    
        //4. SAVE DATA TO STATE 
        this.chartData = sortedData;
    }

    //save current year to state
    versusBarChartSetCurrentYear(year){
        this.versusBarChartConfig.currentYear = year;
    }

    //set status needed for chart, show which set of data should be hidden
    versusBarChartSetShowHide(){
        this.versusBarChartConfig.hideShow = {
            firstVarHidden: false,
            secondVarHidden: false
        };
    }

    //CHANGE LABELS ACORDING TO CURRENT USER SCREEN SIZE
    versusBarChartChangeLabels(currentLabelsSize){
        
        //1. SAVE CURRENT LABELS AND NEW LABELS
        const currentLabels = this.chartData.labels;
        const newLabels = []

        //2. DEPENDS IN WHAT WAY IT IS NECESSERY TO CHANGE LABELS (FROM LONG TO SHORT OR SHORT TO LONG) SAVE LABELS TO CORRECT ARRAYS
        let fromLabels = [];
        let toLabels = [];

        //3. READ FROM ARGUMENT IN WHICH WAY CHANGE WILL BE SONE
        if(currentLabelsSize === "small"){
            fromLabels = this.regionsNames.regionLongNames;
            toLabels = this.regionsNames.regionShortnames;
        }
        if(currentLabelsSize === "big"){
            fromLabels = this.regionsNames.regionShortnames;
            toLabels = this.regionsNames.regionLongNames;
        }

        //4. CREATE NEWLABELS ARRAY
        currentLabels.forEach( label => {
            fromLabels.forEach( (longname, index) =>{
              if(label === longname){
                newLabels.push(toLabels[index]);
              }
          });
        });

        //5. SAVE DATA TO STATE
        this.chartData.labels = newLabels;
    };

    //SAVE ACTUAL SCREEN SIZE
    setCurrentScreenSize(){
        //1. READ USER SCREEN SIZE AND SAVE TO STATE
        if(window.innerWidth > 600){
            this.screenSize = "big"
        };

        if(window.innerWidth <= 600){
            this.screenSize = "small"
        };
    };
}