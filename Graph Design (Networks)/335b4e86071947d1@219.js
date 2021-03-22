import define1 from "./a33468b95d0b15b0@699.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["countries-50m.json",new URL("./files/55260abbc777c0a3b8fed19f3929dd822fef9d5118b53b76b2176d20782910e599eac919999ea8ee85a60b783fd37082574f6591fd46c0d70ddf9b00df71ce27",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Graph Design (Networks)

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
#### Create an overview of the relationships between countries so that it is possible to see who donates to whom and how much.<br><br>

#### The main question one should be able to answer is: who are the major donors and to which countries do they donate the most and how much?<br><br>

#### And conversely, who are the major receivers and which countries do they receive from the most and how much?<br><br>

#### We only care about the top 10 recipients and the top 20 donors (over the whole time) for this question.<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Heat Map
I choose the heap map as a solution to Visualization 1. Each rectangle in the heap map represents a relationship between a donor country and a recipient country. Colour intensities attached to rectangles represent the magnitudes of donations. The unit used in text labels in the legend is billions since I want to squeeze the sizes of these text labels. Also, the y-axis represents the top 20 countries donating commitment amounts, and x-axis represents the top 10 countries receiving donations. Lastly, I assign thin and light grey lines next to each rectangle for aesthetic value since one can identify white rectangles as pairs of countries which do not have relationships as regards donations instead of blobs of white areas.

I think that this visualization is suitable and effective because it is intuitive to demonstrate with coloured rectangles the magnitudes of donations. The preceding reason can be factual in that one can easily examine the colour intensities of rectangles to compare the magnitudes of commitment amounts which donor countries donate. By encoding colours to whether or not the commitment amounts are donated more, I can easily differentiate which rectangles represent more donation amounts. Also, I can differentiate which pairs of countries have relationships as regards donations.

#### Punchcard Chart
I also choose the punchcard chart as another solution to Visualization 1. Each circle in the chart represents a relationship between a donor country and a recipient country. Then, the sizes of circles represent the magnitudes of donations. The y-axis represents the top 20 countries donating commitment amounts, and x-axis represents the top 10 countries receiving donations. Lastly, I position vertically and horizontally thin and light grey lines to the x-axis and y-axis ticks to locate circles more precisely.

I think that this visualization is suitable and effective because it is intuitive to demonstrate the magnitudes of donations with noticeable circles in the chart. The preceding reason can be factual in that one can easily examine the sizes of circles to compare the magnitudes of donations. By encoding the sizes of circles to the magnitudes of donations, I can easily examine which circles represent more donation amounts. Also, introducing thin and light grey lines to locate circles ameliorates examining relationships as regards donations between a donor country and a recipient country.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Advantage of the heat map
If the sizes of rectangles are tiny, the tiny rectangles are still noticeable in comparisons between objects. Also, differences in colour intensities attached to rectangles are perceptible in the comparisons.

#### Disadvantage of the heat map
If some data amounts are scarce, the colour intensities attached to rectangles with scarce data will become hard to notice. The aforementioned scenarios may hinder the comparisons.

#### Advantage of the punchcard chart
The large sizes of circles are noticeable in comparisons between objects. If many objects are involved in the comparisons, one can still compare the objects according to the sizes of their respective circles.

#### Disadvantage of the punchcard chart
The differences in the varied sizes of circles are hard to notice in comparisons between objects. The aforementioned situation is even worse if the sizes of the circles are tiny since the tiny circles become somewhat disappeared, which severely hinder the comparisons. The reason for the aforementioned scenarios is probably because the sizes of circles are inherently unnoticeable.`
)});
  main.variable(observer("donorRelations")).define("donorRelations", ["d3","aiddata"], function(d3,aiddata)
{
    return [...function*() { yield *d3.rollup(aiddata, v => v, d => d.donor); }()]
           .map(data => ({
               country: data[0],
               recipient: [...function*() {
                    yield *d3.rollup(data[1], v => d3.sum(v, d => d.commitment_amount), d => d.recipient);
               }()]
               .map(d => ({country: d[0], value: d[1]}))
               .sort((a, b) => d3.descending(a.value, b.value))
           }))
           .sort((a, b) => d3.descending(
                d3.sum(a.recipient, d => d.value), d3.sum(b.recipient, d => d.value)
           ))
           .slice(0, 20);
}
);
  main.variable(observer("top20Donors")).define("top20Donors", ["donorRelations"], function(donorRelations){return(
donorRelations.map(d => d.country)
)});
  main.variable(observer("lookupDonors")).define("lookupDonors", ["top20Donors"], function(top20Donors){return(
Object.fromEntries([...function*() { yield *top20Donors.entries(); }()].map(d => d.reverse()))
)});
  main.variable(observer("recipientRelations")).define("recipientRelations", ["d3","aiddata"], function(d3,aiddata)
{
    return [...function*() { yield *d3.rollup(aiddata, v => v, d => d.recipient); }()]
           .map(data => ({
               country: data[0],
               recipient: [...function*() {
                  yield *d3.rollup(data[1], v => d3.sum(v, d => d.commitment_amount), d => d.donor);
               }()]
               .map(d => ({country: d[0], value: d[1]}))
               .sort((a, b) => d3.descending(a.value, b.value))
           }))
           .sort((a, b) => d3.descending(
                d3.sum(a.recipient, d => d.value), d3.sum(b.recipient, d => d.value)
           ))
           .slice(0, 10);
}
);
  main.variable(observer("top10Recipients")).define("top10Recipients", ["recipientRelations"], function(recipientRelations){return(
recipientRelations.map(d => d.country)
)});
  main.variable(observer("lookupRecipients")).define("lookupRecipients", ["top10Recipients"], function(top10Recipients){return(
Object.fromEntries(
    [...function*() { yield *top10Recipients.entries(); }()].map(d => d.reverse())
)
)});
  main.variable(observer("donations")).define("donations", ["donorRelations","lookupRecipients"], function(donorRelations,lookupRecipients){return(
donorRelations.map(
    data => data.recipient.filter(d => lookupRecipients[d.country] !== undefined)
                          .map(d => ({donor: data.country, recpient: d.country, value: d.value}))
).flat()
)});
  main.variable(observer("donationExtent")).define("donationExtent", ["d3","donations"], function(d3,donations){return(
d3.extent(donations, d => d.value)
)});
  main.variable(observer("donationColor")).define("donationColor", ["d3","donationExtent"], function(d3,donationExtent){return(
d3.scaleSequential(donationExtent.map(d => d/1e9), d3.interpolateBlues)
)});
  main.variable(observer()).define(["legend","donationColor"], function(legend,donationColor){return(
legend({color: donationColor, tickFormat: d => `$${d}B`, title: 'Donation Amount in USD'})
)});
  main.variable(observer("heatMap")).define("heatMap", ["d3","top10Recipients","DOM","top20Donors","donations","donationColor"], function(d3,top10Recipients,DOM,top20Donors,donations,donationColor)
{
    const margin = {top: 70, right: 0, bottom: 0, left: 105};
    const width = 850 - margin.left - margin.right;
  
    const x = d3.scaleBand()
      .domain(top10Recipients)
      .range([0, width]);
  
    const height = x.step() * top10Recipients.length - margin.left - margin.right;

    const svg = d3.select(DOM.svg(width + margin.left + margin.right,
                                  height + margin.top + margin.bottom));
  
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    const y = d3.scaleBand()
      .domain(top20Donors)
      .range([0, height]);
  
    const xAxis = d3.axisTop(x)
      .tickPadding(10)
      .tickSize(0);
  
    const yAxis = d3.axisLeft(y)
      .tickPadding(10)
      .tickSize(0);
  
    g.append('g')
      .call(xAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', width/2)
        .attr('y', -30)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Top 10 Recipients');

    g.append('g')
      .call(yAxis)
      .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', -9)
        .attr('y', -5)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Top 20 Donators');

    g.selectAll('rect')
      .data(donations)
      .join('rect')
        .attr('x', d => x(d.recpient))
        .attr('y', d => y(d.donor))
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', d => donationColor(d.value/1e9));

    g.selectAll('.hline')
      .data(top20Donors)
      .join('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.append('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.selectAll('.vline')
      .data(top10Recipients)
      .join('line')
        .attr('class', 'vline')
        .attr('x1', d => x(d))
        .attr('x2', d => x(d))
        .attr('y1', y(donations[0].country))
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.append('line')
        .attr('class', 'vline')
        .attr('x1', width)
        .attr('x2', width)
        .attr('y1', y(donations[0].country))
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);

    g.append('text')
        .attr('x', width/2)
        .attr('y', -70)
        .attr('font-size', '14px')
        .attr('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .text('Donation Amounts for Top 20 Donors and Top 10 Recipients (1973-2013)');
  
    return svg.node();
}
);
  main.variable(observer("donationMap")).define("donationMap", ["d3","aiddata","top10Recipients","lookupRecipients","top20Donors","lookupDonors"], function(d3,aiddata,top10Recipients,lookupRecipients,top20Donors,lookupDonors)
{
    const data = d3.rollup(
        aiddata,
        v => d3.sum(v, d => d.commitment_amount),
        d => top10Recipients[lookupRecipients[d.recipient]], 
        d => top20Donors[lookupDonors[d.donor]]
    )

    data.delete(undefined);
    data.forEach((value, key, map) => map.get(key).delete(undefined));
    return data;
}
);
  main.variable(observer("donationMapExtent")).define("donationMapExtent", ["d3","donationMap"], function(d3,donationMap){return(
d3.extent([...donationMap].map(d => [...d[1]].map(d => d[1])).flat())
)});
  main.variable(observer("punchcard")).define("punchcard", ["d3","top10Recipients","top20Donors","donationMap","donationExtent"], function(d3,top10Recipients,top20Donors,donationMap,donationExtent)
{
    const margin = {top: 40, right: 120, bottom: 45, left: 85};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(top10Recipients)
      .range([0, width])
      .padding(0.5);
  
    const xAxis = d3.axisBottom(x);
  
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', width/2 + 2)
        .attr('y', 35)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Top 10 Recipients');

    const y = d3.scalePoint()
      .domain(top20Donors)
      .range([0, height])
      .padding(0.5);
  
    const yAxis = d3.axisLeft(y);

    g.append('g')
        .call(yAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', -9)
        .attr('y', -5)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Top 20 Donors');
  
    const cols = g.selectAll('.col')
      .data(donationMap)
      .join('g')
        .attr('transform', ([recipient, _]) => `translate(${x(recipient)},0)`);

    g.selectAll('.hline')
      .data(top20Donors)
      .join('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.selectAll('.vline')
      .data(top10Recipients)
      .join('line')
        .attr('class', 'vline')
        .attr('x1', d => x(d))
        .attr('x2', d => x(d))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    const maxRadius = 1.875;
    const radius = d3.scaleRadial()
      .domain([0, donationExtent[1]])
      .range([0, maxRadius*maxRadius*Math.PI]);

    cols.selectAll('circle')
      .data(([_, donorWithDonations]) => donorWithDonations)
      .join('circle')
        .attr('cy', ([donor, _]) => y(donor))
        .attr('cx', 0)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.9)
        .attr('r', ([_, amount]) => radius(amount));
  
    const legend = g.append('g')
        .attr('transform', `translate(${width + 42},12)`)
      .selectAll('g')
      .data([2.5*1e9, 5*1e9, 1*1e10, 2.5*1e10, 5*1e10])
      .join('g')
        .attr('transform', (d, i) => `translate(0,${i * (11 + 1.5*i)})`);

    legend.append('circle')
      .attr('r', d => radius(d))
      .attr('fill', 'steelblue')
      .attr('opacity', 0.9);

    legend.append('text')
      .attr('x', maxRadius + 20)
      .attr('y', 4)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .text(d => `${d/1e9}B`);
  
    legend.append('text')
      .attr('x', -40)
      .attr('y', -17)
      .attr('fill', 'black')
      .style('font-family', 'sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((_, i) => i === 0 ? 'Donation Amount' : null);
  
    g.append('text')
      .attr('x', 138)
      .attr('y', -25)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .text(`Donation Amounts for Top 20 Donors & Top 10 Recipients (1973-2013)`);

    return svg.node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Visualization 2:
#### Considering only the top 5 purposes of donation, how does the relationship between countries look like in terms of purposes?<br><br>

#### What composition (distribution) of purposes do the donations between each pair of countries have?<br><br>

#### Are there countries that donate to a given country using multiple purposes?<br><br>

#### Or do counties always donate using one single purpose when donating to another country?<br><br>

#### The same as the previous question, we only care about the top 10 recipients and the top 20 donors here.<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the punchcard chart as a solution to Visualization 2. Each circle in the chart represents a relationship between a donor country and a recipient country. Then, the sizes of circles represent the magnitudes of donations. Next, colour hues attached to arcs in a circle represent the top 5 purposes of donation, and the sizes of coloured arcs represent magnitudes corresponding to the top 5 purposes. The y-axis represents the top 20 countries donating commitment amounts, and x-axis represents the top 10 countries receiving donations. Also, I position vertically and horizontally thin and light grey lines to the x-axis and y-axis ticks to locate circles more precisely. Lastly, I restrict the sizes of smaller circles representing donations less than or equal to 1 billion to a certain small radius since I want to inspect clearly the distribution of the top 5 purposes in a circle.

I think that this visualization is suitable and effective because it is intuitive to show the magnitudes of donations with noticeable circles in the chart. Also, it is instinctive to show the composition of the top 5 purposes with coloured arcs in circles. The preceding reason can be factual in that one can easily inspect the sizes of circles to compare the magnitudes of donations. One can also inspect the colour hues and the sizes of arcs in a circle to compare the magnitudes corresponding to the top 5 purposes. By encoding the sizes of circles to the magnitudes of donations and encoding the colour hues and the sizes of arcs to the magnitudes of the top 5 purposes, I can easily inspect which circles represent more donation amounts and which arcs in a circle represent more donation amounts for specific purposes. Also, introducing the thin and light grey lines to locate circles ameliorates inspecting relationships as regards donations between a donor country and a recipient country.`
)});
  main.variable(observer("top5Purposes")).define("top5Purposes", ["d3","aiddata"], function(d3,aiddata)
{
    return [...function*() { yield *d3.rollup(aiddata, v => v, d => d.coalesced_purpose_name); }()]
           .map(d => [d[0], d3.sum(d[1], d => d.commitment_amount)])
           .sort((a, b) => d3.descending(a[1], b[1]))
           .slice(0, 5)
           .map(d => d[0]);
}
);
  main.variable(observer("lookupPurposes")).define("lookupPurposes", ["top5Purposes"], function(top5Purposes){return(
Object.fromEntries(top5Purposes.map((d, i) => [d, i]))
)});
  main.variable(observer("purposeRelations")).define("purposeRelations", ["d3","aiddata","lookupDonors","lookupRecipients","lookupPurposes"], function(d3,aiddata,lookupDonors,lookupRecipients,lookupPurposes)
{
    const data = d3.rollup(
        aiddata,
        data => d3.rollup(data, v => d3.sum(v, d => d.commitment_amount), d => d.coalesced_purpose_name),
        d => d.donor,
        d => d.recipient
    );
  
    return Array.from(data, ([donor, dData]) => {
        if (lookupDonors[donor] !== undefined) {
            return Array.from(dData, ([recipient, rData]) => {
                if (lookupRecipients[recipient] !== undefined) {
                    return {
                        donor: donor,
                        recipient: recipient,
                        purposes: [...function*() { yield *rData; }()]
                                  .filter(d => lookupPurposes[d[0]] !== undefined)
                                  .map(d => ({name: d[0], value: d[1]}))
                    };
                }
            }).filter(d => d !== undefined && d.purposes.length !== 0);
        }
    }).filter(d => d !== undefined)
      .flat();
}
);
  main.variable(observer("lookupRelations")).define("lookupRelations", ["purposeRelations"], function(purposeRelations)
{
    return Object.fromEntries(purposeRelations.map((d, i) => [[d.donor, d.recipient], i])); 
}
);
  main.variable(observer("purposeExtent")).define("purposeExtent", ["d3","purposeRelations"], function(d3,purposeRelations){return(
d3.extent(purposeRelations.map(d => d3.sum(d.purposes, d => d.value)))
)});
  main.variable(observer("pie")).define("pie", ["d3"], function(d3){return(
d3.pie()
        .sort(null)
        .value(d => d.value)
)});
  main.variable(observer("purposeColor")).define("purposeColor", ["d3","top5Purposes"], function(d3,top5Purposes)
{
    const scheme = d3.schemeCategory10;
    return d3.scaleOrdinal(top5Purposes, [scheme[0], scheme[1], scheme[3], 'seagreen', scheme[9]]);
}
);
  main.variable(observer("radius")).define("radius", ["d3","purposeExtent"], function(d3,purposeExtent){return(
d3.scaleRadial()
  .domain(purposeExtent)
  .range([2.5, 3.5].map(d => d*d*Math.PI))
)});
  main.variable(observer("pieChart")).define("pieChart", ["pie","d3","DOM","radius","purposeColor"], function(pie,d3,DOM,radius,purposeColor){return(
data => {  
    const arcs = pie(data.purposes);
    const sum = d3.sum(data.purposes, d => d.value);
  
    const margin = {top: 38, right: 0, bottom: 0, left: 38};
    const width = 76 - margin.left - margin.right;
    const height = 76 - margin.top - margin.bottom;

    const svg = d3.select(DOM.svg(width + margin.left + margin.right,
                                  height + margin.top + margin.bottom));
  
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius(sum));

    g.append('g')
        .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
        .attr('fill', d => purposeColor(d.data.name))
        .attr('d', arc)
      .append('title')
        .text(d => `${d.data.name}: ${d.data.value} (${d3.format('.2f')(d.data.value/sum)})`);
  
    return svg.node();
}
)});
  main.variable(observer("pieMatrix")).define("pieMatrix", ["d3","top20Donors","top10Recipients","purposeRelations","lookupRelations","pieChart","radius"], function(d3,top20Donors,top10Recipients,purposeRelations,lookupRelations,pieChart,radius){return(
(rows, cols, offset) => {
  const margin = {top: 65, bottom: 0, right: 110, left: 85};
  const width = 950 - margin.left - margin.right;
  const height = 1500 - margin.top - margin.bottom;
  
  const svg = d3.create('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const row = d3.scaleBand()
    .domain(d3.range(rows))
    .range([0, height])
    .padding(0.01);
  
  const col = d3.scaleBand()
    .domain(d3.range(cols))
    .range([0, width])
    .padding(0.01);
  
  const grids = d3.cross(d3.range(rows), d3.range(cols))
    .map(([row, col]) => ({row, col})).slice(0, rows*cols - offset);
  
  g.selectAll('.vline')
    .data(grids.filter((d, i) => Math.floor(i/10) === 0))
    .join('line')
      .attr('class', 'vline')
      .attr('x1', d => col(d.col) + 38)
      .attr('x2', d => col(d.col) + 38)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'grey')
      .attr('stroke-width', 0.2);
  
  g.selectAll('.hline')
    .data(grids.filter((d, i) => i%10 === 0))
    .join('line')
      .attr('class', 'hline')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => row(d.row) + 38)
      .attr('y2', d => row(d.row) + 38)
      .attr('stroke', 'grey')
      .attr('stroke-width', 0.2);
  
  const cells = g.selectAll('.cell')
    .data(grids)
    .join('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${col(d.col)},${row(d.row)})`);
  
  cells.append('rect')
    .attr('width', col.bandwidth())
    .attr('height', row.bandwidth())
    .attr('fill', 'white')
    // .attr('stroke', 'grey')
    .attr('opacity', 0);
      
  cells.nodes().forEach(
      (d, i) => {
          const donor = top20Donors[Math.floor(i/10)];
          const recipient = top10Recipients[i%10];
          const purposes = purposeRelations[lookupRelations[`${donor},${recipient}`]];
          if (purposes !== undefined)
              return d.appendChild(pieChart(purposes));
      }
  );

  cells.append('text')
    .attr('x', 38)
    .attr('y', -5)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .text((d, i) => {
        if (Math.floor(i/10) === 0)
            return top10Recipients[i%10];
    });
  
  cells.append('text')
    .attr('x', -8)
    .attr('y', 41)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('text-anchor', 'end')
    .text((d, i) => {
        if (i%10 === 0)
            return top20Donors[i/10];
    });
  
  const legend = g.append('g')
      .attr('transform', `translate(${width + 52},13)`)
    .selectAll('g')
    .data([1e9, 5*1e9, 1e10])
    .join('g')
      .attr('transform', (d, i) => `translate(0,${i * (60 + 2*i)})`);
  
  legend.append('circle')
    .attr('r', d => radius(d))
    .attr('fill', 'steelblue')
    .attr('opacity', 0.9);

  const legends = ['≤ 1B', '5B', '10B'];
  legend.append('text')
    .attr('x', 38)
    .attr('y', 3)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('text-anchor', 'start')
    .text((d, i) => legends[i]);
  
  legend.append('text')
    .attr('x', -40)
    .attr('y', -38)
    .attr('fill', 'black')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .text((_, i) => i === 0 ? 'Donation Amount' : null);
  
  g.append('text')
    .attr('x', width/2 + 39)
    .attr('y', -25)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'end')
    .text('Top 10 Recipients');
  
  g.append('text')
    .attr('x', -7)
    .attr('y', 18)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'end')
    .text('Top 20 Donators'); 

  g.append('text')
    .attr('x', width/2)
    .attr('y', -65)
    .attr('font-size', '12px')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'hanging')
    .text('Top 5 Purposes of Donation for Top 20 Donors and Top 10 Recipients (1973-2013)');
  
  return svg.node();
}
)});
  main.variable(observer()).define(["swatches","purposeColor"], function(swatches,purposeColor){return(
swatches({color: purposeColor})
)});
  main.variable(observer()).define(["pieMatrix"], function(pieMatrix){return(
pieMatrix(20, 10, 0)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## [OPTIONAL] Visualization 3:
#### For this last exercise you have to extend the analysis above to see how the patterns of donations change over time.<br><br>

#### Focusing again on the top 10 recipients and top 20 donors how do the patterns of donations (who donates to whom and how much) change over time?<br><br>

#### Are there sudden changes?<br><br>

#### Are there countries that always donate to other countries?<br><br>

#### Are there major shifts (say a country used to donate to a specific set of countries and then it changes to other countries)?<br><br>`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`I choose the punchcard chart as a solution to Visualization 3. Each circle in a punchcard chart represents a relationship between a donor country and a recipient country. Then, the sizes of circles represent the magnitudes of donations. The y-axis represents the top 20 countries donating commitment amounts, and x-axis represents the top 10 countries receiving donations. Also, I position vertically and horizontally thin and light grey lines to the x-axis and y-axis ticks to locate circles more precisely. Lastly, I create a small multiple chart of punchcard charts, each of which corresponding to aggregated data over five years, and punchcard charts in the small multiple chart are laid out in a grid system. The introduction of the small multiple of punchcard charts is to show the patterns of donations between donor countries and recipient countries, that is, relationships as regards donations between donor countries and recipient countries shift over time.

I think that this visualization is suitable and effective because it is intuitive to show with punchcard charts in a small multiple chart the magnitudes of donations and shifts in relationships as regards donations between countries over time. The preceding reason can be factual in that one can easily inspect the sizes of circles in a punchcard chart to compare the magnitudes of donations. Also, one can easily identify shifts in the positions and the sizes of circles between punchcard charts, each of which corresponding to aggregated data over five years, in a small multiple chart to inspect shifts in relationships as regards donations between countries over time. By encoding the sizes of circles to the magnitudes of donations, I can easily inspect which circles represent more donation amounts over a specific five-year time span. Also, introducing thin and light grey lines to locate circles ameliorates inspecting relationships as regards donations between donor countries and recipient countries. Lastly, introducing a small multiple chart of punchcard charts ameliorates the findings of shifts in the magnitudes of donations and relationships as regards donations between countries over different five-year time spans.`
)});
  main.variable(observer("years")).define("years", ["d3","aiddata"], function(d3,aiddata){return(
[...new Set(function*() { yield *d3.rollup(aiddata, v => v, d => d.yearInt).keys(); }())]
        .sort((a,b) => d3.ascending(a, b))
)});
  main.variable(observer("reducedYears")).define("reducedYears", ["years"], function(years){return(
[...new Set(years.map(d => Math.trunc(d/10)*10 + +(d%10 < 5 ? 0 : 5)))]
)});
  main.variable(observer("donationsOverYears")).define("donationsOverYears", ["d3","aiddata","lookupRecipients","lookupDonors"], function(d3,aiddata,lookupRecipients,lookupDonors)
{
    const data = d3.rollup(
        aiddata,
        v => d3.sum(v, d => d.commitment_amount),
        d => lookupRecipients[d.recipient] !== undefined ? d.recipient : undefined,
        d => lookupDonors[d.donor] !== undefined ? d.donor : undefined,
        d => Math.trunc(d.yearInt/10)*10 + +(d.yearInt%10 < 5 ? 0 : 5)
    );
    
    data.delete(undefined);
    data.forEach((value, key, map) => map.get(key).delete(undefined));
    return data;
}
);
  main.variable(observer("yearlyDonationExtent")).define("yearlyDonationExtent", ["donationsOverYears","d3"], function(donationsOverYears,d3)
{
    const data = [...function*() { yield *donationsOverYears; }()]
                 .map(d => [...function*() { yield *d[1]; }()]
                           .map(d => [...function*() { yield *d[1]; }()]
                                     .map(d => d[1])
                           ).flat()
                 ).flat();
  
    return d3.extent(data);
}
);
  main.variable(observer("lookupRecipientAbbr")).define("lookupRecipientAbbr", ["geoJSON","lookupRecipients"], function(geoJSON,lookupRecipients)
{
    return Object.fromEntries(
        geoJSON.features.map(
            d => [d.properties.ADMIN === 'South Korea' ? 'Korea' : d.properties.ADMIN, d.properties.ISO_A3]
        ).filter(d => lookupRecipients[d[0]] !== undefined)
    );
}
);
  main.variable(observer("punchcardChart")).define("punchcardChart", ["d3","top10Recipients","lookupRecipientAbbr","top20Donors","donationsOverYears","yearlyDonationExtent","years"], function(d3,top10Recipients,lookupRecipientAbbr,top20Donors,donationsOverYears,yearlyDonationExtent,years){return(
year => {
    const margin = {top: 40, right: 120, bottom: 45, left: 85};
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(top10Recipients.map(d => lookupRecipientAbbr[d]))
      .range([0, width])
      .padding(0.5);
  
    const xAxis = d3.axisBottom(x);
  
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', width/2 + 2)
        .attr('y', 35)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Top 10 Recipients');

    const y = d3.scalePoint()
      .domain(top20Donors)
      .range([0, height])
      .padding(0.5);
  
    const yAxis = d3.axisLeft(y);

    g.append('g')
        .call(yAxis)
        .call(g => g.selectAll('.domain').remove())
      .append('text')
        .attr('x', -8)
        .attr('y', -5)
        .attr('fill', 'black')
        .attr('font-family', 'sans-serif')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('Top 20 Donors');
  
    const cols = g.selectAll('.col')
      .data(donationsOverYears)
      .join('g')
        .attr('transform', ([recipient, _]) => `translate(${x(lookupRecipientAbbr[recipient])},0)`);

    g.selectAll('.hline')
      .data(top20Donors)
      .join('line')
        .attr('class', 'hline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(d))
        .attr('y2', d => y(d))
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    g.selectAll('.vline')
      .data(top10Recipients.map(d => lookupRecipientAbbr[d]))
      .join('line')
        .attr('class', 'vline')
        .attr('x1', d => x(d))
        .attr('x2', d => x(d))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.1);
  
    const maxRadius = 2;
    const radius = d3.scaleRadial()
      .domain([0, yearlyDonationExtent[1]])
      .range([0, maxRadius*maxRadius*Math.PI]);

    cols.selectAll('circle')
      .data(([_, donorWithDonations]) => donorWithDonations)
      .join('circle')
        .attr('cy', ([donor, _]) => y(donor))
        .attr('cx', 0)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.9)
        .attr('r', ([_, donations]) => donations.has(year) ? radius(donations.get(year)) : 0);
  
    const legend = g.append('g')
        .attr('transform', `translate(${width + 42},12)`)
      .selectAll('g')
      .data([5*1e8, 1*1e9, 2.5*1e9, 5*1e9, 1*1e10])
      .join('g')
        .attr('transform', (d, i) => `translate(0,${i * (11 + 1.5*i)})`);

    legend.append('circle')
      .attr('r', d => radius(d))
      .attr('fill', 'steelblue')
      .attr('opacity', 0.9);

    legend.append('text')
      .attr('x', maxRadius + 15)
      .attr('y', 4)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .text(d => `${d/1e9}B`);
  
    legend.append('text')
      .attr('x', -20)
      .attr('y', -17)
      .attr('fill', 'black')
      .style('font-family', 'sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .text((_, i) => i === 0 ? 'Amount' : null);
  
    const yearTitle = year === 1970 ? `${years[0]}-${year+4}`
                      : year === 2010 ? `${year}-${years[years.length-1]}`
                      : `${year}-${year+4}`;
  
    g.append('text')
      .attr('x', -10)
      .attr('y', -25)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '12px')
      .text(`Donations for Top 20 Donors & Top 10 Recipients (${yearTitle})`);

    return svg.node();
}
)});
  main.variable(observer("punchCardMatrix")).define("punchCardMatrix", ["d3","punchcardChart","reducedYears"], function(d3,punchcardChart,reducedYears){return(
(rows, cols, offset) => {
  const margin = {top: 0, bottom: 0, right: 30, left: 0};
  const width = 1000 - margin.left - margin.right;
  const height = 2000 - margin.top - margin.bottom;
  
  const svg = d3.create('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const row = d3.scaleBand()
    .domain(d3.range(rows))
    .range([0, height])
    .padding(0.01);
  
  const col = d3.scaleBand()
    .domain(d3.range(cols))
    .range([0, width])
    .padding(0.01);
  
  const grids = d3.cross(d3.range(rows), d3.range(cols))
    .map(([row, col]) => ({row, col})).slice(0, rows*cols - offset);
  
  const cells = g.selectAll('.cell')
    .data(grids)
    .join('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${col(d.col)},${row(d.row)})`);
  
  cells.append('rect')
    .attr('width', col.bandwidth())
    .attr('height', row.bandwidth())
    .attr('fill', 'white')
    .attr('stroke', 'grey')
      
  cells.nodes().forEach((d, i) => d.appendChild(punchcardChart(reducedYears[i])));
  return svg.node();
}
)});
  main.variable(observer()).define(["punchCardMatrix"], function(punchCardMatrix){return(
punchCardMatrix(5, 2, 1)
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
