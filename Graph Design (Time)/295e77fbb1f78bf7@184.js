import define1 from "./a33468b95d0b15b0@699.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["countries-50m.json",new URL("./files/55260abbc777c0a3b8fed19f3929dd822fef9d5118b53b76b2176d20782910e599eac919999ea8ee85a60b783fd37082574f6591fd46c0d70ddf9b00df71ce27",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Graph Design (Time)

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
md`## Visualization 1:
#### How does the amount donated vs. amount received change over time for each country?;<br><br>

#### Are there countries that mostly send or mostly receive and countries that have a similar amount of donations they receive and send?;<br><br>

#### Are there countries that change their role over time? That is, they used to mostly send donations and turn into mostly receiving donations and vice-versa?;<br><br>

#### Are there countries in which you can find a sudden increase ("peak") or a sudden decrease ("valley")?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the heat map as a solution to Visualization 1. Each rectangle in the heat map represents the magnitudes of commitment amounts, and colours attached to rectangles represent whether or not the commitment amounts are donated or received more for some countries in specific years. The unit used in text labels in the legend is billions since I want to squeeze the sizes of these text labels. Also, the y-axis represents countries donated or received commitment amounts, and x-axis represents years. Lastly, I assign thin and light grey lines next to each rectangle for aesthetic value in that countries which did not donate or receive commitment amounts for specific years can be identified as white rectangles instead of blobs of white areas.

I think that this visualization is suitable and effective because it is intuitive to demonstrate with coloured rectangles the magnitudes of commitment amounts and whether or not the commitment amounts are donated or received more for some countries in specific years. The preceding reason can be factual in that one can easily examine the colour intensities and colour hues of rectangles to compare the magnitudes of the commitment amounts that countries donate or receive. By encoding colours to whether or not the commitment amounts are donated or received more, I can easily differentiate which rectangles represent the commitment amounts are donated or received more for some countries in specific years.`
)});
  main.variable(observer("years")).define("years", ["d3","aiddata"], function(d3,aiddata){return(
[...new Set(function*() { yield *d3.rollup(aiddata, v => v, d => d.yearInt).keys(); }())]
        .sort((a,b) => d3.ascending(a, b))
)});
  main.variable(observer("reducedYears")).define("reducedYears", ["years"], function(years){return(
[...new Set(years.map(d => Math.trunc(d/10)*10 + +(d%10 < 5 ? 0 : 5)))]
)});
  main.variable(observer("netValues")).define("netValues", ["aiddata","d3"], function(aiddata,d3)
{
    const data = aiddata.map(
        d => ({
          year: d.yearInt, donor: d.donor, recipient: d.recipient, commitment_amount: d.commitment_amount
        })
    );
  
    const nDict = {};
    for (const d of data) {
        const year = d.year;
                    
        if (nDict[d.donor] === undefined)
            nDict[d.donor] = {[year]: -d.commitment_amount};
        else if (nDict[d.donor][year] === undefined)
            nDict[d.donor] = {...nDict[d.donor], ...{[year]: -d.commitment_amount}};
        else
            nDict[d.donor][year] -= d.commitment_amount;
      
        if (nDict[d.recipient] === undefined)
            nDict[d.recipient] = {[year]: d.commitment_amount};
        else if (nDict[d.recipient][year] === undefined)
            nDict[d.recipient] = {...nDict[d.recipient], ...{[year]: d.commitment_amount}};
        else
            nDict[d.recipient][year] += d.commitment_amount;
    }
    
    return Object.entries(nDict).map(
        d => Object.entries(d[1]).map(
            v => ({country: d[0], year: v[0], value: v[1], total: d3.sum(Object.entries(d[1]), o => o[1])})
        )
    ).sort((a, b) => d3.ascending(a[0].total, b[0].total))
     .flat();
    // return Object.entries(nDict).map(
    //            d => Object.entries(d[1]).map(v => ({country: d[0], year: v[0], value: v[1]}))).flat();
}
);
  main.variable(observer("countries")).define("countries", ["netValues"], function(netValues){return(
[...new Set(netValues.map(d => d.country))]
)});
  main.variable(observer("netExtent")).define("netExtent", ["d3","netValues"], function(d3,netValues){return(
d3.extent(netValues, d => d.value)
)});
  main.variable(observer("netRange")).define("netRange", ["netExtent","d3","netValues"], function(netExtent,d3,netValues){return(
[netExtent[0], d3.mean(netValues, d => d.value), netExtent[1]]
)});
  main.variable(observer("netColor")).define("netColor", ["d3","netRange"], function(d3,netRange){return(
d3.scaleDiverging(netRange.map(d => d/1e9), t => d3.interpolatePuOr(1-t))
)});
  main.variable(observer()).define(["legend","netColor"], function(legend,netColor){return(
legend({color: netColor,
        tickFormat: d => `$${d}B`,
        title: '←Donate More ------- Net Commitment Amounts ------- Receive More→'})
)});
  main.variable(observer("heatMap")).define("heatMap", ["d3","years","DOM","countries","netValues","netColor"], function(d3,years,DOM,countries,netValues,netColor)
{
    const margin = {top: 70, right: 45, bottom: 10, left: 105};
    const width = 1000 - margin.left - margin.right;
  
    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
  
    const height = x.step() * years.length - margin.left - margin.right;;

    const svg = d3.select(DOM.svg(width + margin.left + margin.right,
                                  height + margin.top + margin.bottom));
  
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    const y = d3.scaleBand()
      .domain(countries)
      .range([0, height])
      .padding(0);
  
    const xAxis = d3.axisTop(x)
      .tickFormat('');
  
    const yAxis = d3.axisLeft(y)
      .tickPadding(10)
      .tickSize(0);
  
    g.append('g')
      .call(xAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('fill', 'black')
        .attr('x', width/2)
        .attr('y', -30)
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Year');;

    g.append('g')
      .call(yAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('fill', 'black')
        .attr('x', -9)
        .attr('y', -5)
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Countries');
  
    g.selectAll('.year')
      .data(years)
      .join('text')
        .attr('class', 'year')
        .style('font', '10px sans-serif')
        .attr('x', 0)
        .attr('y', 0)
        .attr('transform', d => `translate(${x(d)},-5)rotate(-30)`)
        .text(d => d);

    g.selectAll('rect')
      .data(netValues)
      .join('rect')
        .attr('x', d => x(d.year))
        .attr('y', d => y(d.country))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => netColor(d.value/1e9));

    g.selectAll('.hline')
      .data(countries)
      .join('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.1);
  
    g.append('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.1);
  
    g.selectAll('.vline')
      .data(years)
      .join('line')
        .attr('class', 'vline')
        .attr('x1', d => x(d))
        .attr('x2', d => x(d))
        .attr('y1', y(netValues[0].country))
        .attr('y2', height)
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.1);
  
    g.append('line')
        .attr('class', 'vline')
        .attr('x1', width)
        .attr('x2', width)
        .attr('y1', y(netValues[0].country))
        .attr('y2', height)
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.1);

    g.append('text')
        .attr('font-size', '16px')
        .attr('font-family', 'sans-serif')
        .attr('dominant-baseline', 'hanging')
        .attr('x', width/2)
        .attr('y', -margin.top)
        .attr('text-anchor', 'middle')
        .text('Net Commitment Amounts for Each Country (1973-2013)');
  
    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Visualization 2:
#### Focus on the top 10 “Coalesced Purposes” of donations (in terms of amount of disbursement across all countries and all time).<br><br>

#### What are the top 10 purposes of disbursements (in terms of total amount of disbursement) and how does their relative amount compare over time?<br><br>

#### E.g., are there purposes that tend to be prominent for a period of time and others that become more prominent during other periods?<br><br>

#### Hint: looking at the graph one should be able to observe: “Ah! During these years donations were mostly about X but then there were way more donations about Y”.<br><br>

#### Note: if the purpose is “UNSPECIFIED” it should be removed.<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Stacked bar chart
I choose the stacked bar chart as a solution to Visualization 2. Each rectangle within vertical bars in the chart represents the relative amounts of disbursements as regards donations, and colours attached to rectangles represent the top 10 purposes of disbursements across all countries for all years. Also, the y-axis represents the relative amounts of the disbursements for the top 10 purposes of the disbursements, and x-axis represents years.

I think that this visualization is suitable and effective because it is intuitive to demonstrate the relative amounts of disbursements regarding donations with coloured rectangles within vertical bars in the chart. The preceding reason can be factual in that one can easily examine the lengths of the rectangles to compare the relative amounts of the disbursements and inspect the colour hues of the rectangles to identify the top 10 purposes of disbursements across all countries for all years. By encoding lengths to the relative amounts of the disbursements and colours to the top 10 purposes of the disbursements, I can easily examine the distribution concerning the relative amounts of disbursements from the top 10 purposes across all countries for a specific year.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Punchcard Chart
I also choose the punchcard chart as another solution to Visualization 2. Each circle in the chart represents the relative amounts of disbursements as regards donations. Also, the y-axis represents the relative amounts of the disbursements for the top 10 purposes of disbursements across all countries for all years, and x-axis represents years. Lastly, I position vertically and horizontally thin and light grey lines to the x-axis and y-axis ticks to locate the circles more precisely.

I think that this visualization is suitable and effective because it is intuitive to demonstrate the relative amounts of disbursements regarding donations with noticeable circles in the chart. The preceding reason can be factual in that one can easily examine the sizes of the circles to compare the relative amounts of the disbursements. By encoding the sizes of the circles to the relative amounts of the disbursements, I can easily examine the distribution concerning the relative amounts of the disbursements from the top 10 purposes across all countries for a specific year. Also, introducing the thin and light grey lines to locate the circles ameliorates the comparisons of the relative amounts of the disbursements between the top 10 purposes for a specific year.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Advantage of the stacked bar chart
If the sizes of rectangles are tiny, the tiny rectangles are still noticeable in comparisons between objects. Also, the differences in the varied sizes of rectangles are perceptible in the comparisons. The reason for the aforementioned scenarios is probably attributed to the use of colour hues.

#### Disadvantage of the stacked bar chart
If one selects unsuitable colour hues to encode objects, arranges the colour hues in unsuited ways to correspond to objects or too many colour hues are involved in comparisons between objects, the aforementioned scenarios may hinder the comparisons.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Advantage of the punchcard chart
The large sizes of circles are noticeable in comparisons between objects. If many objects are involved in the comparisons, one can still compare the objects according to the sizes of their respective circles. The reason for the aforementioned scenario is probably attributed to the absence of colour hues, which eliminates troublesome in comparisons between numerous objects.

#### Disadvantage of the punchcard chart
The differences in the varied sizes of circles are hard to notice in comparisons between objects. The aforementioned situation is even worse if the sizes of the circles are tiny since the tiny circles become somewhat disappeared, which severely hinder the comparisons. The reason for the aforementioned scenarios is probably because the sizes of circles are inherently unnoticeable.`
)});
  main.variable(observer("purposeData")).define("purposeData", ["d3","aiddata"], function(d3,aiddata)
{
    return Array.from(
        d3.rollup(aiddata, v => v, d => d.coalesced_purpose_name, d => d.yearInt),
        ([name, yearToValue]) => {
            const data = [...function*() {yield *yearToValue.entries()}()]
                .map(d => ({year: d[0], value: d3.sum(d[1], v => v.commitment_amount)}))
                .sort((a, b) => d3.ascending(a.year, b.year));
                
            const value = d3.sum(data, d => d.value);
            return {name, value, data};
        })
        .filter(d => d.name !== 'Sectors not specified')
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0,10)
        .sort((a, b) => d3.ascending(a.name, b.name));
}
);
  main.variable(observer("top10Purposes")).define("top10Purposes", ["purposeData"], function(purposeData){return(
purposeData.map(d => d.name)
)});
  main.variable(observer("sortByPurpose")).define("sortByPurpose", ["top10Purposes"], function(top10Purposes){return(
top10Purposes.reduce((acc, curr, i) => {acc[curr] = i; return acc;}, {})
)});
  main.variable(observer("yearlyPurposes")).define("yearlyPurposes", ["purposeData","top10Purposes","sortByPurpose","d3"], function(purposeData,top10Purposes,sortByPurpose,d3)
{
    const data = purposeData.map(
        d => d.data.map(v => ({name: d.name, year: v.year, value: v.value}))
    ).flat();
  
    const reducer = (acc, curr) => {
        acc[curr.year] === undefined ? acc[curr.year] = {[curr.name]: curr.value}
        : acc[curr.year][curr.name] === undefined ? acc[curr.year][curr.name] = curr.value
          : Object.assign(acc[curr.year][curr.name] += curr.value);
      
        return acc;
    };
  
    return Array.from(Object.entries(data.reduce(reducer, {})), ([year, data]) => {
        let base = 0;
        const purposes = Array.from(Object.entries(data), ([name, value]) => ({name, value}));
        
        top10Purposes.forEach(d => 
            purposes.find(v => v.name === d) === undefined
            ? purposes.push({name:d, value:0}) : d
        );
                              
        purposes.sort((a, b) => sortByPurpose[a.name] - sortByPurpose[b.name]);
        return {year, purposes};
    }).flat()
      .sort((a, b) => d3.ascending(a.year, b.year))
      .map(d => d.purposes.reduce((acc, curr) => {acc[curr.name] = curr.value; return acc;}, {year: d.year}));
}
);
  main.variable(observer("stackedExpand")).define("stackedExpand", ["d3","top10Purposes","yearlyPurposes"], function(d3,top10Purposes,yearlyPurposes){return(
d3.stack()
    .keys(top10Purposes)
    .offset(d3.stackOffsetExpand)(yearlyPurposes)
)});
  main.variable(observer("purposeColor")).define("purposeColor", ["d3","top10Purposes"], function(d3,top10Purposes){return(
d3.scaleOrdinal(
    top10Purposes,
    d3.schemeCategory10
)
)});
  main.variable(observer()).define(["swatches","purposeColor"], function(swatches,purposeColor){return(
swatches({color: purposeColor})
)});
  main.variable(observer("relativeStackedBarChart")).define("relativeStackedBarChart", ["d3","years","stackedExpand","purposeColor"], function(d3,years,stackedExpand,purposeColor)
{
    const margin = {top: 40, right: 40, bottom: 40, left: 35};
    const width = 1000 - margin.left - margin.right;
  
    const x = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);
  
    const height = (x.step() * years.length - margin.top - margin.bottom) / 2;
  
    const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    const y = d3.scaleLinear()
      .domain([0, 1]).nice()
      .range([height, 0]);
  
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y)
      .tickFormat(d3.format('.0%'));
  
    g.append('g')
        .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .call(g => g.selectAll('.domain').remove())
      .selectAll('text')
        .attr('transform', 'rotate(-30)');
    
    g.append('text')
        .attr('x', width/2 - 12)
        .attr('y', height + 35)
        .attr('fill', 'black')
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Year');
  
    g.append("g")
      .call(yAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('fill', 'black')
        .attr('x', 35)
        .attr('y', -10)
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Percentages');
  
    const series = g.selectAll('.series')
      .data(stackedExpand)
      .join('g')
        .attr('class', 'series')
        .attr('fill', d => purposeColor(d.key))
      .selectAll('.rect')
      .data(d => d)
      .join('rect')
        .attr('class', d => 'rect')
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('x', d => x(d.data.year))
        .attr('width', x.bandwidth());

    g.append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '16px')
      .attr('dominant-baseline', 'hanging')
      .attr('x', width/2 + 5)
      .attr('y', -margin.top)
      .attr('text-anchor', 'middle')
      .text('Relative Amounts of the Top 10 Purposes of Donations (1973-2013)');

    return svg.node();
}
);
  main.variable(observer("yearlyPurposesWithPCTs")).define("yearlyPurposesWithPCTs", ["yearlyPurposes","d3"], function(yearlyPurposes,d3)
{
    const data = Object.entries(yearlyPurposes).map(d => [d[1].year, Object.entries(d[1]).slice(1)]);
    const sums = data.map(d => d3.sum(d[1].map(v => v[1])));
    return new Map(data.map((d, i) => [d[0], new Map(d[1].map(v => [v[0], v[1]/sums[i]]))]));
}
);
  main.variable(observer("relativePunchcardChart")).define("relativePunchcardChart", ["d3","years","reducedYears","top10Purposes","yearlyPurposesWithPCTs"], function(d3,years,reducedYears,top10Purposes,yearlyPurposesWithPCTs)
{
    const margin = {top: 40, right: 85, bottom: 30, left: 195};
    const width = 975 - margin.left - margin.right;
    const height = 335 - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scalePoint()
      .domain(years)
      .range([0, width])
      .padding(0.5);
  
    const xAxis = d3.axisBottom(x)
      .tickValues(reducedYears.slice(1));
  
    g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', width/2 - 5)
        .attr('y', 30)
        .attr('fill', 'black')
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Year')
      .selectAll('text')
        .text(d => d === (Math.trunc(d/10)*10 + +(d%10 < 5 ? 0 : 5)) || d === 'Year' ? d : null);

    const y = d3.scalePoint()
      .domain(top10Purposes)
      .range([0, height])
      .padding(0.5);
  
    const yAxis = d3.axisLeft(y);

    g.append('g')
        .call(yAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', -5)
        .attr('y', 0)
        .attr('fill', 'black')
        .style('font-family', 'sans-serif')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Top 10 Purposes');
  
    const cols = g.selectAll('.col')
      .data(yearlyPurposesWithPCTs)
      .join('g')
        .attr('transform', ([year, _]) => `translate(${x(year)}, 0)`);

    g.selectAll('.hline')
      .data(top10Purposes)
      .join('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.selectAll('.vline')
      .data(reducedYears.slice(1))
      .join('line')
        .attr('class', 'vline')
        .attr('x1', d => x(d))
        .attr('x2', d => x(d))
        .attr('y1', y(top10Purposes))
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    const maxRadius = 1.875;
    const radius = d3.scaleSqrt()
      .domain([0, 1])
      .range([0, maxRadius*maxRadius*Math.PI]);
  
    cols.selectAll('circle')
      .data(([_, percentageWithPurpose]) => percentageWithPurpose)
      .join('circle')
        .attr('cy', ([purpose, _]) => y(purpose))
        .attr('cx', 0)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.9)
        .attr('r', ([_, percentage]) => radius(percentage));
  
    const legend = g.append('g')
        .attr('transform', `translate(${width + margin.right - 55}, -7)`)
      .selectAll('g')
      .data([0.2, 0.6, 1])
      .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * (15 + 2*i)})`);

    legend.append('circle')
      .attr('r', d => radius(d))
      .attr('fill', 'steelblue');

    legend.append('text')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .attr('x', maxRadius + 15)
      .attr('y', 5)
      .text(d => d*100 + '%');
  
    legend.append('text')
      .attr('x', -25)
      .attr('y', -17)
      .attr('fill', 'black')
      .style('font-family', 'sans-serif')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((_, i) => i === 0 ? 'Percentages' : null);
  
    g.append('text')
      .attr('x', width/7 + 7)
      .attr('y', -25)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '16px')
      .text('Relative Amounts of the Top 10 Purposes of Donations (1973-2013)');

    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## [OPTIONAL] Visualization 3: 
#### Focusing exclusively on countries that receive donations, how do donations shift geographically over time?<br><br>

#### Do donations tend to be always in the same regions of the world over the years or they have been shifting over time?<br><br>

#### Can you build a visualization that shows the “history of donations” so that one can get a sense of which regions of the world have had more need for donations over the years?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the choropleth map as a solution to Visualization 3. Varied blues attached to regions within the map corresponds to countries receiving donations, and colour intensities represent the magnitudes of commitment amounts as regards donations for the countries. Also, I create a small multiple chart of choropleth maps, each of which corresponding to aggregated data over five years, and choropleth maps in the small multiple chart are laid out in a grid system. The introduction of the small multiple of choropleth maps is to show the history of donations, that is, donations shift geographically over time.

I think that this visualization is suitable and effective because it is intuitive to demonstrate with choropleth maps in a small multiple chart the magnitudes of commitment amounts regarding donations and geographical shifts in donations over time. The preceding reason can be factual in that one can easily examine the colour intensities of regions in a choropleth map to compare the magnitudes of the commitment amounts for countries receiving donations. Also, one can easily identify shifts in blue coloured regions between choropleth maps, each of which corresponding to aggregated data over five years, in a small multiple chart to inspect geographical shifts in donations over time. By encoding colour intensities to the magnitudes of the commitments amounts, I can easily examine the distribution concerning the magnitudes of the commitments amounts for countries receiving donations over a specific five-year time span. Also, introducing a small multiple chart of choropleth maps ameliorates the findings of the shifts in the magnitudes of the commitment amounts over different five-year time spans.`
)});
  main.variable(observer("receivedDonations")).define("receivedDonations", ["aiddata"], function(aiddata)
{
    const data = aiddata.map(d => ({
            year: d.yearInt, recipient: d.recipient, commitment_amount: d.commitment_amount
        })
    );
  
    const rDict = {};
    for (const d of data) {
        const year = Math.trunc(d.year/10)*10 + +(d.year%10 < 5 ? 0 : 5);
      
        if (rDict[d.recipient] === undefined)
            rDict[d.recipient] = {[year]: d.commitment_amount};
        else if (rDict[d.recipient][year] === undefined)
            rDict[d.recipient] = {...rDict[d.recipient], ...{[year]: d.commitment_amount}};
        else
            rDict[d.recipient][year] += d.commitment_amount;
    }
  
    return rDict;
}
);
  main.variable(observer("reducedYearlyDonations")).define("reducedYearlyDonations", ["receivedDonations","d3"], function(receivedDonations,d3)
{
    const data = Object.entries(receivedDonations).map(
                     d => Object.entries(d[1]).map(v => ({country: d[0], year: v[0], value: v[1]}))).flat();
    
    return [...d3.rollup(data, v => v, d => d.year)]
           .reduce((acc, curr) => Object.assign(acc, {[curr[0]]:
               curr[1].reduce((acc, curr) => Object.assign(acc, {[curr.country]: curr.value}), {})
           }), {});
}
);
  main.variable(observer("lookupName")).define("lookupName", ["receivedDonations","geoJSON"], function(receivedDonations,geoJSON)
{
    const netCountry = Object.keys(receivedDonations);
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
  main.variable(observer("donationRange")).define("donationRange", ["d3","reducedYearlyDonations"], function(d3,reducedYearlyDonations){return(
d3.extent(Object.entries(reducedYearlyDonations)
                  .map(d => Object.entries(d[1]).map(v => v[1])).flat())
)});
  main.variable(observer("donationColor")).define("donationColor", ["d3","donationRange"], function(d3,donationRange){return(
d3.scaleSequential(donationRange.map(d => d/1e9), d3.interpolateBlues)
)});
  main.variable(observer("worldMap")).define("worldMap", ["d3","geoJSON","donationColor","lookupName","years","legend"], function(d3,geoJSON,donationColor,lookupName,years,legend){return(
(year, donations) => {
    const margin = {top: 0, right: 40, bottom: 0, left: 5};
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    const projection =  d3.geoNaturalEarth1().fitSize([width, height], geoJSON);
    const path = d3.geoPath().projection(projection);
  
    g.selectAll('.border')
      .data(geoJSON.features)
      .join('path')
        .attr('class', 'border')
        .attr('d', path)
        .attr('fill', d => donationColor(donations[year][lookupName[d.properties.NAME_EN]]/1e9) || 'lightgray')
        .attr('stroke', 'black')
        .attr('stroke-width', 0.125);
  
    const yearTitle = year === 1970 ? `${years[0]}-${year+4}`
                      : year === 2010 ? `${year}-${years[years.length-1]}`
                      : `${year}-${year+4}`;
  
    g.append('text')
      .attr('font-size', '12px')
      .attr('font-family', 'sans-serif')
      .attr('dominant-baseline', 'hanging')
      .attr('x', width / 6.5)
      .attr('y', 350)
      .text(`The History of Received Donations by Country (${yearTitle})`);

    const legned = legend({color: donationColor, title: `Received Donations in Billions (${yearTitle})`});
    g.node().appendChild(legned);
    return svg.node();
}
)});
  main.variable(observer("worldMaps")).define("worldMaps", ["d3","worldMap","reducedYears","reducedYearlyDonations","donationColor"], function(d3,worldMap,reducedYears,reducedYearlyDonations,donationColor){return(
(rows, cols, offset) => {
  const margin = {top: 0, bottom: 0, right: 50, left: 0};

  const width = 1000 - margin.left - margin.right;
  const height = 2000 - margin.top - margin.bottom;
  
  const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
  
  const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  const row = d3.scaleBand()
      .domain(d3.range(rows))
      .range([0, height])
      .padding(0.01);
  
  const col = d3.scaleBand()
      .domain(d3.range(cols))
      .range([0, width])
      .padding(0.01);
  
  const grids = d3.cross(d3.range(rows),
                         d3.range(cols)).map(([row, col]) => ({row, col})).slice(0, rows*cols - offset);
  
  const cells = g.selectAll('.cell')
    .data(grids)
    .join('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${col(d.col)}, ${row(d.row)})`);
  
  cells.append('rect')
      .attr('width', col.bandwidth())
      .attr('height', row.bandwidth())
      .attr('fill', 'white')
      .attr('stroke', 'grey')
      
  cells.nodes().forEach((d, i) => d.appendChild(
      worldMap(reducedYears[i], reducedYearlyDonations, donationColor)
  ));
  
  return svg.node();
}
)});
  main.variable(observer()).define(["worldMaps"], function(worldMaps){return(
worldMaps(5, 2, 1)
)});
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
