import define1 from "./a33468b95d0b15b0@699.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["countries-50m.json",new URL("./files/55260abbc777c0a3b8fed19f3929dd822fef9d5118b53b76b2176d20782910e599eac919999ea8ee85a60b783fd37082574f6591fd46c0d70ddf9b00df71ce27",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Graph Design (Geo)

## Data

Load a [simplified and reduced version](https://docs.google.com/spreadsheets/d/1YiuHdfZv_JZ-igOemKJMRaU8dkucfmHxOP6Od3FraW8/) of the [AidData dataset](https://www.aiddata.org/data/aiddata-core-research-release-level-1-3-1).`
)});
  main.variable(observer("aiddata")).define("aiddata", ["d3","googleSheetCsvUrl"], async function(d3,googleSheetCsvUrl){return(
await d3.csv(googleSheetCsvUrl, row => ({
  yearDate: d3.timeParse('%Y')(row.year),
  yearInt: +row.year,
  aiddata_id: row.aiddata_id,
  aiddata_2_id: row.aiddata_2_id,
  donor: row.donor,
  recipient: row.recipient,
  commitment_amount: +row.commitment_amount_usd_constant,
  coalesced_purpose_code: row.coalesced_purpose_code,
  coalesced_purpose_name: row.coalesced_purpose_name,
}))
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Load GeoJSON data for countries. This file is derived from data from [Natural Earth](https://www.naturalearthdata.com).`
)});
  main.variable(observer("geoJSON")).define("geoJSON", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("countries-50m.json").json()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Visualization 1
#### How do the countries compare in terms of how much they receive and donate?<br><br>

#### Are there countries that donate much more than they receive or receive much more than they donate?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the bar chart to represent how much money countries donate or receive. Bars represent the magnitudes of commitment amounts, and colours represent actions regarding the amounts. I also add text labels alongside bars to provide detailed values of the amounts. The unit used in text labels is billions since I want to squeeze the sizes of text labels. Lastly, I assign light grey bars to each y-axis tick to easily match y-axis tick labels to respective red or blue bars.

I think that this visualization is suitable and effective because it is intuitive to demonstrate the magnitudes of commitment amounts with bars in that one can easily examine the lengths of bars to compare the magnitudes of the amounts that countries donate or receive. By encoding colours to actions as regards commitment amounts, I can easily differentiate which bar represents donating money or receiving money.`
)});
  main.variable(observer("data")).define("data", ["aiddata","d3"], function(aiddata,d3)
{
    const values = {};
    for (let d of aiddata) {
        values[d.donor] === undefined
        ? values[d.donor] = {donate: -d.commitment_amount, receive: 0}
        : values[d.donor].donate -= d.commitment_amount;

        values[d.recipient] === undefined
        ? values[d.recipient] = {donate: 0, receive: d.commitment_amount}
        : values[d.recipient].receive += d.commitment_amount;
    }

    return Array.from(new Map(Object.entries(values)), ([country, values]) => {
        return {
            country: country,
            donate: values.donate,
            receive: values.receive
        };
    }).sort((a, b) => d3.ascending(a.donate+a.receive, b.donate+b.receive));
}
);
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleOrdinal(['Donate money', 'Receive money'], d3.schemeSet1)
)});
  main.variable(observer()).define(["swatches","color"], function(swatches,color){return(
swatches({color: color})
)});
  main.variable(observer("divergingBarChart")).define("divergingBarChart", ["d3","data","color"], function(d3,data,color)
{
    const margin = ({top: 30, right:150, bottom: 30, left: 105});
    const height = 750 + margin.top + margin.bottom;
    const width = 750 + margin.left + margin.right;
  
    const svg = d3.create('svg')
        .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
 
    g.append('text')
      .attr('font-size', '16px')
      .attr('dominant-baseline', 'hanging')
      .attr('x', width / 2 - margin.left - 65)
      .attr('y', -margin.top)
      .text('The Commitment Amount Donated and Received by Country, from 1973 to 2013');
    
    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.donate), d3.max(data, d => d.receive)])
        .range([margin.left*3/4, width - margin.right])
        .nice();

    const y = d3.scaleBand()
        .domain(data.map(d => d.country))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

    const xAxis = d3.axisTop(x)
        .ticks(10)
        .tickFormat(d => {
            if (d < 0) d = -d;
            return `${d/1e9}B`;
        });
    
    const yAxis = d3.axisLeft(y);
  
    g.append('g')
        .attr('transform', `translate(0, ${margin.top})`)
        .call(xAxis)
        .call(g => g.select('.domain').remove());
        
    g.append('g')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis)
        .call(g => g.select('.domain').remove());
  
    g.selectAll('.gray rect')
        .data(data)
        .join('rect')
            .attr('x', 0)
            .attr('y', d => y(d.country))
            .attr('width', width)
            .attr('height', y.bandwidth())
            .attr('fill', 'lightgray')
            .attr('opacity', 0.25);
  
    g.selectAll('.red rect')
        .data(data)
        .join('rect')
            .attr('x', d => x(d.donate))
            .attr('y', d => y(d.country))
            .attr('width', d => Math.abs(x(d.donate) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', d => color('Donate money'));
  
    g.selectAll('.blue rect')
        .data(data)
        .join('rect')
            .attr('x', d => x(0))
            .attr('y', d => y(d.country))
            .attr('width', d => Math.abs(x(d.receive) - x(0)))
            .attr('height', y.bandwidth())
            .attr('fill', d => color('Receive money'));

    g.append('g')
        .selectAll('text')
        .data(data)
        .join('text')
            .attr('x', d => x(d.donate) - 50)
            .attr('y', d => y(d.country) + y.bandwidth()*3/4)
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .text(d => d3.format('.5f')(-d.donate/1e9))
  
    g.append('g')
        .selectAll('text')
        .data(data)
        .join('text')
            .attr('x', d => x(d.receive) + 5)
            .attr('y', d => y(d.country) + y.bandwidth()*3/4)
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .text(d => d3.format('.5f')(d.receive/1e9))
 
   g.append('g')
       .selectAll('text')
       .data(['← Donate more money (billions)'])
       .join('text')
           .attr('x', (width - margin.left)/2 - 250)
           .attr('y', 0)
           .attr('font-family', 'sans-serif')
           .attr('font-size', 14)
           .attr('font-weight', 'bold')
           .text(d => d);
  
   g.append('g')
       .selectAll('text')
       .data(['Receive more money (billions) →'])
       .join('text')
           .attr('x', (width - margin.left)/2 + 10)
           .attr('y', 0)
           .attr('font-family', 'sans-serif')
           .attr('font-size', 14)
           .attr('font-weight', 'bold')
           .text(d => d);
  
   g.append('g')
       .selectAll('text')
       .data(['Country'])
       .join('text')
           .attr('x', width/5 - margin.left - margin.right - 7.5)
           .attr('y', margin.top - 5)
           .attr('font-family', 'sans-serif')
           .attr('font-size', 14)
           .attr('font-weight', 'bold')
           .text(d => d);
  
    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Visualization 2
#### Do the countries that mostly receive or mostly donate tend to cluster around specific geographical areas of the world?<br><br>

#### Are there neighboring countries that have radically different patterns in terms of how much they receive vs. how much they donate?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the choropleth map to represent whether neighbouring countries have similar or radically different patterns concerning how much money they donate or receive. I use the diverging colour scheme to represent the magnitude of a net commitment amount for each respective country by combining how much money each country receives and donates. If the colour becomes more orange, it indicates that a country donates more money than it receives. If the colour becomes bluer, it indicates that a country receives more money than it donates.
Also, I encode the geographical areas of the world to the positions of countries.

I think that this visualization is suitable and effective because it is intuitive to demonstrate the magnitude of a net commitment amount by inspecting colour hue or colour intensity, both of which represent whether donating or receiving money affects a net commitment amount of a country more. The geographical areas of the world swiftly enable me to identify the locations of countries and to examine whether some countries cluster together in the specific areas of the world.`
)});
  main.variable(observer("countryToNetData")).define("countryToNetData", ["data"], function(data)
{
    const netData = {};
    data.forEach(d => netData[d.country] = d.donate + d.receive);
    return netData;
}
);
  main.variable(observer("lookupName")).define("lookupName", ["countryToNetData","geoJSON"], function(countryToNetData,geoJSON)
{
    const netCountry = Object.keys(countryToNetData);
    const geoCountry = geoJSON.features.map(d => [d.properties.NAME_EN, d.properties.NAME_EN]);
    const intersection = geoCountry.filter(d => netCountry.indexOf(d[0]) >= 0);
    const netInGeo =  Object.fromEntries(intersection);
  
    const geoToNet = ({
        'United States of America': 'United States',
        'South Korea': 'Korea',
        'Slovakia': 'Slovak Republic'
    })
  
    return ({...netInGeo, ...geoToNet});
}
);
  main.variable(observer("netRange")).define("netRange", ["d3","countryToNetData"], function(d3,countryToNetData)
{
    const ext = d3.extent(Object.values(countryToNetData));
    return [ext[0]/1e9, d3.mean(Object.values(countryToNetData)), ext[1]/1e9];
}
);
  main.variable(observer("netColor")).define("netColor", ["d3","netRange"], function(d3,netRange){return(
d3.scaleDiverging(netRange, t => d3.interpolatePuOr(1 - t))
)});
  main.variable(observer()).define(["legend","netColor"], function(legend,netColor){return(
legend({
    color: netColor,
    title: '← Donate more, Net commitment amount (billions), Receive more →'
})
)});
  main.variable(observer("worldMap")).define("worldMap", ["d3","geoJSON","netColor","countryToNetData","lookupName"], function(d3,geoJSON,netColor,countryToNetData,lookupName)
{
    const margin = {top: 0, right: 40, bottom: 0, left: 0};
    const width = 1000 - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;

    const svg = d3.create('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.append('text')
      .attr('font-size', '16px')
      .attr('dominant-baseline', 'hanging')
      .attr('x', width / 2 - margin.left - margin.right)
      .attr('y', - margin.top - margin.bottom + 5)
      .text('The Net Commitment Amount by Country, from 1973 to 2013');
  
    const projection =  d3.geoNaturalEarth1()
        .fitSize([width, height], geoJSON);

    const path = d3.geoPath().projection(projection);

    g.selectAll('.border')
      .data(geoJSON.features)
      .join('path')
        .attr('class', 'border')
        .attr('d', path)
        .attr('fill', d => netColor(countryToNetData[lookupName[d.properties.NAME_EN]]/1e9) || 'lightgray')
        .attr('stroke', 'black')
        .attr('stroke-width', 0.25)

    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## [OPTIONAL] Visualization 3
#### Are there any major differences in how the top 5 most frequent purposes of disbursements (across all countries) distribute geographically in terms of  countries that receive donations?<br><br>

#### Are there countries that tend to receive more of certain types of donations than others?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the radial stacked bar chart to represent commitment amounts concerning the top 5 most frequent purposes of disbursements distributing geographically for each country receiving donations. The innermost circle of the chart represents x-axis on which countries are located. Also, I arrange countries so that countries in the same region are close to each other at x-axis.

I think that this visualization is suitable and effective because it is intuitive to inspect commitment amounts regarding the purposes of disbursements for each country by simply glancing at the proportions of the colour hues of stacked bars. Also, it is feasible to identify whether countries close to each other have some interesting features in commitment amounts respecting the purposes of disbursements in this chart.`
)});
  main.variable(observer("lookupRegion")).define("lookupRegion", ["geoJSON","lookupName"], function(geoJSON,lookupName)
{
    const features = geoJSON.features.filter(d => lookupName[d.properties.NAME_EN] !== undefined);
    const reducer = (acc, curr) =>
        Object.assign(acc, {[lookupName[curr.properties.NAME_EN]]: curr.properties.SUBREGION});
    return features.reduce(reducer, {});
}
);
  main.variable(observer("inverseLookupName")).define("inverseLookupName", ["lookupName"], function(lookupName)
{
    const reducer = (acc, curr) => Object.assign(acc, {[curr[1]]: curr[0]});
    return Object.entries(lookupName).reduce(reducer, {});
}
);
  main.variable(observer("top5Purposes")).define("top5Purposes", ["d3","aiddata"], function(d3,aiddata)
{
    const purposes = Array.from(d3.rollup(aiddata, v => v.length, d => d.coalesced_purpose_name),
                                ([name, value]) => ({name, value}))
                     .sort((a, b) => d3.descending(a.value, b.value))
                     .filter(d => d.name !== 'Sectors not specified')
                     .slice(0, 5)

    console.log(purposes);
    const reducer = (acc, curr) => Object.assign(acc, {[curr.name]: curr.value});
    return purposes.reduce(reducer, {});
}
);
  main.variable(observer("purposeData")).define("purposeData", ["aiddata","inverseLookupName","top5Purposes","d3","lookupRegion"], function(aiddata,inverseLookupName,top5Purposes,d3,lookupRegion)
{
    let data = {};
    for (let d of aiddata) {
        if (data[d.recipient] === undefined)
            data[d.recipient]= {};
        
        if (data[d.recipient][d.coalesced_purpose_name] === undefined) {
            data[d.recipient][d.coalesced_purpose_name] = {};
            data[d.recipient][d.coalesced_purpose_name]['occurences'] = 1;
            data[d.recipient][d.coalesced_purpose_name]['value'] = d.commitment_amount;
        } else {
            data[d.recipient][d.coalesced_purpose_name]['occurences'] += 1;
            data[d.recipient][d.coalesced_purpose_name]['value'] += d.commitment_amount;
        }
    }
  
    data = Object.entries(data).filter(d => inverseLookupName[d[0]] !== undefined);
    data.forEach(d => {
        d[1] = Object.entries(d[1]).filter(a => a[0] !== 'Sectors not specified'
                                                && top5Purposes[a[0]] !== undefined)
                                   .sort((a, b) => d3.descending(a[1].occurences, b[1].occurences))
                                   .slice(0, 5);

        d[1] = Array.from(d[1], ([purpose, total]) => {
            return {
                purpose: purpose,
                value: total.value
            }
        });
    });

    const objReducer = (acc, curr) => Object.assign(acc, {[curr.purpose]: curr.value});
    const valReducer = (acc, curr) => acc += curr.value;
  
    let purposeData = Array.from(data, ([country, purposes]) => {
        return Object.assign({region: lookupRegion[country]},
                             {country: country},
                             purposes.reduce(objReducer, {}),
                             {total: purposes.reduce(valReducer, 0)});
    }).filter(d => Object.keys(d).length > 3);
  
    purposeData = Array.from(d3.group(purposeData, d => d.region)).flatMap(d => d[1]);
    purposeData.forEach(d => {
        for (let purpose of Object.keys(top5Purposes))
            if(d[purpose] === undefined)
                d[purpose] = 0;
              
        return d;
    });
  
    purposeData['columns'] = Object.keys(top5Purposes);
    return purposeData;
}
);
  main.variable(observer("lookupAbbrev")).define("lookupAbbrev", ["geoJSON","lookupName"], function(geoJSON,lookupName)
{
    const features = geoJSON.features.filter(d => lookupName[d.properties.NAME_EN] !== undefined);
    const reducer = (acc, curr) =>
        Object.assign(acc, {[lookupName[curr.properties.NAME_EN]]: curr.properties.ISO_A3});
    return features.reduce(reducer, {});
}
);
  main.variable(observer("purposeColor")).define("purposeColor", ["d3","top5Purposes"], function(d3,top5Purposes){return(
d3.scaleOrdinal(Object.keys(top5Purposes), 
                               ['#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'])
)});
  main.variable(observer()).define(["swatches","purposeColor"], function(swatches,purposeColor){return(
swatches({color: purposeColor})
)});
  main.variable(observer("radialStackedBarChart")).define("radialStackedBarChart", ["d3","DOM","purposeData","purposeColor","lookupAbbrev"], function(d3,DOM,purposeData,purposeColor,lookupAbbrev)
{    
    const width = 975;
    const height = width;
    const innerRadius = 180;
    const outerRadius = Math.min(width, height) / 2;

    const svg = d3.select(DOM.svg(width, height))
        .attr('viewBox', `${-width/2} ${-height/2} ${width} ${height}`)
        .style("width", '100%')
        .style('height', 'auto')
        .style("font", "10px sans-serif");
  
    const x = d3.scaleBand()
        .domain(purposeData.map(d => d.country))
        .range([0, 2 * Math.PI])
        .align(0);
    
    const y = d3.scaleRadial()
        .domain([0, d3.max(purposeData, d => d.total)])
        .range([innerRadius, outerRadius]);
  
    const arc = d3.arc()
        .innerRadius(d => y(d[0]))
        .outerRadius(d => y(d[1]))
        .startAngle(d => x(d.data.country))
        .endAngle(d => x(d.data.country) + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius);
  
    console.log(d3.stack().keys(purposeData.columns)(purposeData))
    svg.append('g')
       .selectAll('g')
       .data(d3.stack().keys(purposeData.columns)(purposeData))
       .join('g')
           .attr('fill', d => purposeColor(d.key))
       .selectAll('path')
       .data(d => d)
       .join('path')
           .attr('d', arc);
  
    const xAxis = g => g
        .attr('text-anchor', 'middle')
        .call(g => g.selectAll('g')
            .data(purposeData)
            .join('g')
                .attr('transform',
                      d => `rotate(${((x(d.country) + x.bandwidth()/2) * 180/Math.PI - 90)})
                            translate(${innerRadius},0)`)
            .call(g => g.append('line')
                .attr('x2', -5)
                .attr('stroke', '#000'))
            .call(g => g.append('text')
                .attr('transform', d => (x(d.country) + x.bandwidth()/2 + Math.PI/2) % (2 * Math.PI) < Math.PI
                      ? 'rotate(90)translate(0,16)'
                      : 'rotate(-90)translate(0,-9)')
                .text(d => d.country.length < 7 ? d.country.substring(0, 6) : lookupAbbrev[d.country])));
    
    const yAxis = g => g
        .attr('text-anchor', 'middle')
        .call(g => g.selectAll('g')
            .data(y.ticks(5).slice(1))
            .join('g')
                .attr('fill', 'none')
            .call(g => g.append('circle')
                .attr('stroke', '#000')
                .attr('stroke-opacity', 0.5)
                .attr('r', y))
            .call(g => g.append('text')
                .attr('y', d => -y(d))
                .attr('dy', '0.35em')
                .attr('stroke', '#fff')
                .attr('stroke-width', 3)
                .text(d => {return `${y.tickFormat(5, 's')(d).replace(/G/, 'B')}`})
            .clone(true)
                .attr('fill', '#000')
                .attr('stroke', 'none')));

    const legend = g => g.append('g')
        .selectAll('g')
        .data(purposeData.columns.reverse())
        .join('g')
          .attr('transform', (d, i) => `translate(-90, ${(i - (purposeData.columns.length - 1)/2) * 20})`)
          .call(g => g.append('rect')
              .attr('width', 18)
              .attr('height', 18)
              .attr('fill', purposeColor))
          .call(g => g.append('text')
              .attr('x', 24)
              .attr('y', 9)
              .attr('dy', '0.35em')
              .text(d => d))
    
    svg.append('g')
        .call(xAxis);

    svg.append('g')
        .call(yAxis);

    svg.append('g')
        .call(legend);
  
    svg.append('text')
        .attr('font-size', '10px')
        .attr('dominant-baseline', 'hanging')
        .attr('x', 0)
        .attr('y', -70)
        .attr('text-anchor', 'middle')
        .text('Top 5 Most Frequent Purposes of Disbursements by Country');
  
    svg.append('text')
        .attr('font-size', '8px')
        .attr('dominant-baseline', 'hanging')
        .attr('x', -112)
        .attr('y', -58)
        .attr('text-anchor', 'middle')
        .text('(1973-2013)');

    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Notes

- Import Mike Bostock's [Color Legend](/@d3/color-legend) notebook.`
)});
  const child1 = runtime.module(define1);
  main.import("legend", child1);
  main.import("swatches", child1);
  main.variable(observer()).define(["md"], function(md){return(
md`---
## Appendix`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@6')
)});
  main.variable(observer("googleSheetCsvUrl")).define("googleSheetCsvUrl", function(){return(
'https://docs.google.com/spreadsheets/d/1YiuHdfZv_JZ-igOemKJMRaU8dkucfmHxOP6Od3FraW8/gviz/tq?tqx=out:csv'
)});
  return main;
}
