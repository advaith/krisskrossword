function drawHistogramD3(data) {	
	//SVG setup
	const margin = {top: 15, right: 15, bottom: 50, left: 15},
	      width = 350 - margin.left - margin.right,
	      height = 220 - margin.top - margin.bottom;

	//x scales
	//TODO: make the upper most value the minimum between 180 and the max value that exists in the data
	const x = d3.scaleLinear()
	    .rangeRound([0, width])
	    .domain([2, 60]);

	//set up svg
	const svg = d3.select("#histogram_tab_content")
	  .append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform",
	            `translate(${margin.left}, ${margin.top})`);

	//tooltip
	const tooltip = d3.select("body")
	  .append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);

	const t = d3.transition()
	      .duration(1000);


	//number of bins for histogram
	const nbins = 58;

	//Note: data fetching is done each time the function is ran
	//as d3.csv is replaced by tabletop.js request to get data each time
	//from google spreadsheet
	function update(){
	  // Get the data

	  //histogram binning
	    const histogram = d3.histogram()
	      .domain(x.domain())
	      .thresholds(x.ticks(nbins))
	      .value(function(d) { return d.Value;} )

	    //binning data and filtering out empty bins
	    const bins = histogram(data).filter(d => d.length>0)

	    //g container for each bin
	    let binContainer = svg.selectAll(".gBin")
	      .data(bins);

	    binContainer.exit().remove()

	    let binContainerEnter = binContainer.enter()
	      .append("g")
	        .attr("class", "gBin")
	        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

	    //need to populate the bin containers with data the first time
	    binContainerEnter.selectAll("circle")
	        .data(d => d.map((p, i) => {
	          return {idx: i,
	                  name: p.Name,
	                  value: p.Value,
	                  radius: (x(d.x1)-x(d.x0))/2
	                }
	        }))
	      .enter()
	      .append("circle")
	        .attr("class", function(d) {return d.name;})
	        .attr("cx", 0) //g element already at correct x pos
	        .attr("cy", function(d) {
	            return - d.idx * 2 * d.radius - d.radius; })
	        .attr("r", 0)
	        .on("mouseover", tooltipOn)
	        .on("mouseout", tooltipOff)
	        .transition()
	          .duration(500)
	          .attr("r", function(d) {
	          return (d.length==0) ? 0 : d.radius; })

	    binContainerEnter.merge(binContainer)
	        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

	    //enter/update/exit for circles, inside each container
	    let dots = binContainer.selectAll("circle")
	        .data(d => d.map((p, i) => {
	          return {idx: i,
	                  name: p.Day,
	                  value: p.Value,
	                  radius: (x(d.x1)-x(d.x0))/2
	                }
	        }))


	    //UPDATE old elements present in new data.
	    // dots.attr("class", "update");

	    //ENTER new elements present in new data.
	    dots.enter()
	      .append("circle")
	        .attr("class", function (d) { return d.name;})
	        .attr("cx", 0) //g element already at correct x pos
	        .attr("cy", function(d) {
	          return - d.idx * 2 * d.radius - d.radius; })
	        .attr("r", 0)
	      .merge(dots)
	        .on("mouseover", tooltipOn)
	        .on("mouseout", tooltipOff)
	        .transition()
	          .duration(500)
	          .attr("r", function(d) {
	          return (d.length==0) ? 0 : d.radius; })
	  };//d3.csv
	//update

	function tooltipOn(d) {
	  //x position of parent g element
	  let gParent = d3.select(this.parentElement)
	  let translateValue = gParent.attr("transform")

	  let gX = translateValue.split(",")[0].split("(")[1]
	  let gY = height + (+d3.select(this).attr("cy")-50)

	  d3.select(this)
	    .classed("selected", true)
	  tooltip.transition()
	       .duration(200)
	       .style("opacity", .9);
	  tooltip.html(d.name + "<br/> (" + d.value + ")")
	    .style("left", gX + "px")
	    .style("top", gY + "px");
	}//tooltipOn

	function tooltipOff(d) {
	  d3.select(this)
	      .classed("selected", false);
	    tooltip.transition()
	         .duration(500)
	         .style("opacity", 0);
	}//tooltipOff



	// add x axis
	svg.append("g")
	  .attr("class", "axis axis--x")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x));

	//draw everything
	update();
}