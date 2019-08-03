
document.getElementById("app").innerHTML = `
<h1>Hello Krishna!</h1>
<div>
  This is CS 498 Summer 19 Data Visualization Project(7-3-3)
</div>
`;

var data = [4,8,5,10,6];
d3.select("svg").selectAll("rect").data(data).enter().append()
   .attr("width", 19)
   .attr("height", function(d){return 10*d;})
   .attr("x", function(d, i){return 20*i;})
   .attr("y", function(d){return (420 - 10*d);});
