function scatterplotD3(data, day) {
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 320 - margin.left - margin.right,
      height = 100 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var color = d3.scaleOrdinal(["#0173b2", "#de8f05", "#029e73","#d55e00" , "#cc78bc", "#ca9161", "#fbafe4"]);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var svg = d3.select("#world_tab_inner").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  console.log("Scatterplot D3 | ", data)
  //data = [{'Time': 10, 'Type': 'others'}, {'Time': 3, 'Type': 'others'}, {'Time': 1, 'Type': 'me'}]

  var xExtent = d3.extent(data, function(d) { return d.Time; }),
    xRange = xExtent[1] - xExtent[0];

  var yExtent = d3.extent(data, function(d) { return d.Y; }), 
    yRange = yExtent[1] - yExtent[0];

    x.domain([xExtent[0] - (xRange * .05), xExtent[1] + (xRange * .20)]).nice();
    y.domain([0, .3]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Sepal Width (cm)");

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(day + "s")



    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 1.5)
        .attr("cx", function(d) { return x(d.Time); })
        .attr("cy", function(d) { return y(d.Y + randn_bm()/40) ; })
        .style("fill", function(d) { return color(d.Type); });

    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    legend.on('click', function(cname){
        d3.selectAll('.dot')
          .style('opacity', 0.5)
          .filter(function(d){
            return d.Type == cname;
          })
          .style('opacity', 1);
      });
}
