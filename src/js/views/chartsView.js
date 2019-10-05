import Chart from 'chart.js'
import { htmlElements } from './base'
import {  colors, optionsVersusBarChart, optionsCombined, createOptionsVersusBarChart } from './chartsConfig'
// import collection from 'lodash'


//RENDER CHART WITH TWO GUSVARS
export const versusBarChartRender = ( { labels, valuesOne, valuesTwo }, state, {firstVarHidden, secondVarHidden} ) => {
//render chart for population basic 


  if(state.gusApi.versusBarChart == undefined){
    //if chart not exist create

    //1. CREATE OPTIONS PASS INFO IF VARS SHOULD BE HIDDEN OR NOT - BELOW FUNCTION HIDE AXIS 
    const options = createOptionsVersusBarChart({firstVarHidden, secondVarHidden});
  
    //2. CREATE DATA
    const data = {
          labels: labels,
          datasets: [
            {
              hidden: firstVarHidden,
              xAxisID: 'valuesOne',
              data: valuesOne,
              backgroundColor: colors.colorTwo,
              borderWidth: 1,
            },
            {
              hidden: secondVarHidden,
              xAxisID: 'valuesTwo',
              data: valuesTwo,
              backgroundColor: colors.colorThree,
              borderWidth: 1,
            }
      ]}
  
    //2. GET HTML OBJECT TO PUT CHART
      const ctx = htmlElements.charts.versusBarChart; 
  
    //3. CREATE CHART
      state.gusApi.versusBarChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: data,
          options: options
        });
  }else{

    //1. CREATE NEW DATA OBJ FOR VERSUS DATA
    const data = {
      labels: labels,
      datasets: [
        {
          hidden: firstVarHidden,
          xAxisID: 'valuesOne',
          data: valuesOne,
          backgroundColor: colors.colorTwo,
          borderWidth: 1
        },
        {
          hidden: secondVarHidden,
          xAxisID: 'valuesTwo',
          data: valuesTwo,
          backgroundColor: colors.colorThree,
          borderWidth: 1,
        }
      ]}

    //2. ADD NEW DATA TO CHART
    state.gusApi.versusBarChart.chart.data = data;

    //3. GET OPTIONS FOR THIS CHART
    state.gusApi.versusBarChart.chart.options = createOptionsVersusBarChart({firstVarHidden, secondVarHidden});

    //4. UPDATE DATA
    state.gusApi.versusBarChart.chart.update();
  } 

};

//RENDER CHART WITH COMBINED DATA
export const versusBarChartShowCombined = ({labels, valuesCombined}, state) => {


  //1. CREATE NEW DATA OBJ FOR COMBINED DATA
  const data = {
    labels: labels,
    datasets: [
      {
        data: valuesCombined,
        backgroundColor: colors.colorMixTwoThree,
        borderWidth: 1,
      }
    ]}

  //2. ADD NEW DATA TO CHART
  state.gusApi.versusBarChart.chart.data = data;

  //3. GET OPTIONS FOR THIS CHART
  state.gusApi.versusBarChart.chart.options = optionsCombined;

  //4. UPDATE DATA
  state.gusApi.versusBarChart.chart.update();

};

//SHOW OR HIDE ONE OF GUSVARS
export const versusBarChartShowHide = ({ labels, valuesOne, valuesTwo }, state) => {


  const data = {
    labels: labels,
    datasets: [
      {
        hidden: false,
        xAxisID: 'valuesOne',
        data: valuesOne,
        backgroundColor: colors.colorTwo,
        borderWidth: 1,
      },
      {
        hidden: false,
        xAxisID: 'valuesTwo',
        data: valuesTwo,
        backgroundColor: colors.colorThree,
        borderWidth: 1,
      }
]}


};
