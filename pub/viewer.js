/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
window.exports.viewer = (function () {
  function update(el, obj, src, pool) {
    var bgcol = 'white';
    var group = null;
    obj = JSON.parse(obj);
    if(!(obj.data instanceof(Array))){
      obj.data = [obj.data];//has just one element
    }
    if (obj.error) {
      str = "ERROR: " + obj.error;
    } else {
      obj.data.forEach(function(element, index, array){
        if(element.goal && element.current && element.progress){
          group = element;
        } else if(element.bg){
          if(typeof element.bg === "object" && element.bg && element.bg.r){
            bgcol = 'rgb('+ (+element.bg.r) +','+ (+element.bg.g) +','+ (+element.bg.b) +')';
          } else {
            bgcol = element.bg;
          }
        }
      });
    }
    var y = 0;
    var x = 0;
    var r = 0;
    var color = d3.scale.ordinal()
      .range(group.graphcolor);
    var backcolor = d3.scale.ordinal()
      .range(group.backcolor);
    var svgd = d3.select(el);
    svgd.selectAll("g")
      .remove();
    var gr = svgd.selectAll('rect')
      .data(group.progress)
      .enter()
      .append('g');//a group for each 
    svgd.style("background-color", bgcol);
    function styles(selection, these){
      these.forEach(function (p){
        selection
          .style(p.key, p.val);
      });
    }
    if(group.graphtype == 'bar'){
      if(group.gap == 'def'){
        group.gap = 5;
      }
      fontsize = group.thickness+1;
      var textwidth = 0;
      if(group.labels == 'off'){
        fontsize = 0;
      } else {
        var text = gr.append("text")
          .attr("x", group.graphsize)
          .attr("y", function (d, i){return group.thickness + (group.thickness+group.gap)*i;})
          .text(function (d, i){
            if (group.text.length == 1){
              return group.text[0]
                  .replace(/%percent/g, group.progress[i].toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, group.current[i].toFixed(group.dec[i])+'/'+group.goal[i].toFixed(group.dec[i]))
                  .replace(/%goal/g, group.goal[i].toFixed(group.dec[i]))
                  .replace(/%value/g, group.current[i].toFixed(group.dec[i]));
            } else {
              return group.text[i]
                  .replace(/%percent/g, group.progress[i].toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, group.current[i].toFixed(group.dec[i])+'/'+group.goal[i].toFixed(group.dec[i]))
                  .replace(/%goal/g, group.goal[i].toFixed(group.dec[i]))
                  .replace(/%value/g, group.current[i].toFixed(group.dec[i]));
            }
          })
          .style("font-size", fontsize+"px")
          .call(styles, group.style)
          .each(function (d){
            if(this.getBBox().width > textwidth){textwidth = this.getBBox().width;}
          })
          .transition(function (d, i){return "bart"+i;})
          .duration(group.transition*1000)
          .tween("text", function (d, i, a){
            var iprog = d3.interpolate(0, group.progress[i]);
            var ival = d3.interpolate(0, group.current[i]);
            var igoal = d3.interpolate(0, group.goal[i]);
            return function (t){
              if(group.text.length == 1){
                this.textContent = group.text[0]
                  .replace(/%percent/g, +iprog(t).toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, (+(ival(t).toFixed(group.dec[i]))) + "/" + (+(igoal(t).toFixed(group.dec[i]))))
                  .replace(/%goal/g, +(igoal(t).toFixed(group.dec[i])))
                  .replace(/%value/g, +(ival(t).toFixed(group.dec[i])));
              } else {
                this.textContent = group.text[i]
                  .replace(/%percent/g, +iprog(t).toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, (+(ival(t).toFixed(group.dec[i]))) + "/" + (+(igoal(t).toFixed(group.dec[i]))))
                  .replace(/%goal/g, +(igoal(t).toFixed(group.dec[i])))
                  .replace(/%value/g, +(ival(t).toFixed(group.dec[i])));
              }
            }
          });
      }
      gr.append("rect")//one back rectangle per datum
        .attr("x", 0)
        .attr("y", function (d, i){ return (group.thickness+group.gap)*i;})//go down by this much - again, in the relative sense.
        .attr("rx", group.rounding)
        .attr("ry", group.rounding)
        .attr("width", group.graphsize)
        .attr("height", group.thickness)
        .attr("fill", function (d, i){
          var tt = backcolor(i);
          if(isNaN(tt.a)){tt.a = group.backopacity;}
          return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
        });
      //no transition for the back ones.
      if(group.div){
        var progress = group.progress;
        var prog = [];
        var point = [];
        var it = [];
        divwidth = group.graphsize/group.div - group.divwidth;
        gr.append("rect")
          .attr("x", function (d, i){ return point[i] = group.divwidth/2;})
          .attr("y", function (d, i){ return (group.thickness+group.gap)*i;})//this is much easier now that I know I can get the index
          .attr("rx", group.rounding)
          .attr("ry", group.rounding)
          .attr("width", divwidth)
          .attr("height", group.thickness)
          .attr("fill", function (d, i){
            var tt = color(i);
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+0+")";
          })
          .transition(function (d, i){return "bar"+i;})
          .delay(function (d, i){it[i] = 0; return it[i]*group.transition*1000/(group.div*progress[i]/100);})
          .duration(function (d, i){return group.transition*1000/(group.div*progress[i]/100);})
          .attr("fill", function (d, i){
            prog[i] = Math.min(progress[i]/100, 1);
            var ch = Math.min((prog[i])*group.div, 1);
            prog[i] -= (1/group.div);//decrease the running progress by the divider's size
            var tt = color(i);
            if(isNaN(tt.a)){tt.a = group.graphopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a*ch+")";
          })
          .each(function (e, i){return divr(e, i);});
        function divr(e, i){
          if(prog[i] > 0){
            point[i] += divwidth + group.divwidth;
            it[i]++;
            d3.select(gr[0][i]).append("rect")
              .attr("x", function (d){return point[i];})//moved over
              .attr("y", function (d){ return (group.thickness+group.gap)*i;})//exactly the same
              .attr("rx", group.rounding)
              .attr("ry", group.rounding)
              .attr("width", divwidth)
              .attr("height", group.thickness)
              .attr("fill", function (d){
                var tt = color(i);
                return "rgba("+tt.r+","+tt.g+","+tt.b+","+0+")";
              })
              .transition()
              .delay(function (d){return it[i]*group.transition*1000/(group.div*progress[i]/100);})
              .duration(function (d){return group.transition*1000/(group.div*progress[i]/100);})
              .attr("fill", function (d){
                var ch = Math.min((prog[i])*group.div, 1);
                prog[i] -= (1/group.div);//decrease the running progress by the divider's size
                var tt = color(i);
                if(isNaN(tt.a)){tt.a = group.graphopacity;}
                return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a*ch+")";
              })
              .each(function (e){return divr(e, i);});
          }
        };
      } else {
        var clamp = [];
        gr.append("rect")//one per datum, again.
          .attr("x", 0)
          .attr("y", function (d, i){ return (group.thickness+group.gap)*i;})//this is much easier now that I know I can get the index
          .attr("rx", group.rounding)
          .attr("ry", group.rounding)
          .attr("width", function (d, i){
            clamp = clamp.concat(Math.min(group.current[i]/group.goal[i], 1));
            return (group.rounding*2 < group.graphsize*clamp[i] ? group.rounding*2 : group.graphsize*clamp[i]);})
          .attr("height", group.thickness)
          .attr("fill", function (d, i){
            var tt = color(i);
            if(isNaN(tt.a)){tt.a = group.graphopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
          })
          .transition(function (d, i){return "bar"+i;})//if the function doesn't work figure out another naming convention
          .duration(group.transition*1000)
          .attr("width", function (d, i) {return group.graphsize*clamp[i];});
      }
      y = (group.thickness+group.gap)*group.goal.length - group.gap;
      x = group.graphsize+textwidth;
      var xt = 0;
      var yt = 0;
      var cos = Math.abs(Math.cos(group.rotation*(Math.PI/180)));
      var sin = Math.abs(Math.sin(group.rotation*(Math.PI/180)));
      if(group.rotation > 90){
        yt = cos*y;
        if(group.rotation < 270){
          xt += cos*x;
        } else {
          yt -= cos*y;
        }
        if(group.rotation > 180){
          yt += sin*x;
        }
      }
      if(group.rotation < 180){
        xt += sin*y;
      }
      gr
        .attr("transform", "translate("+xt+","+yt+") rotate("+group.rotation+")");
      svgd
        .attr("height", svgd.node().getBBox().height + "px")
        .attr("width", svgd.node().getBBox().width + "px");
    } else if(group.graphtype == 'rad'){
      if(group.innerradius){
        var l = group.goal.length-1;
        if(group.secondary){
          for(var v = 0;v < group.goal.length;v++){
            if(group.progress[v] > 100){
              l++;//need more room for secondary bars.
            }
          }
        }
        group.thickness = (group.graphsize - group.innerradius)/((l));
        if(group.gap == 'def'){
          group.thickness = group.thickness/2;
          group.gap = group.thickness;
        } else {
          group.thickness -= group.gap;
        }
      }
      if(group.gap == 'def' && !group.innerradius){
        group.gap = group.thickness;
      }
      var r = group.graphsize - group.thickness;
      if(r<0){r=0;}
      var rot = group.rotation*(Math.PI/180);
      var redfl = group.secondary;
      var radarc = group.arc*Math.PI/180;
      var box = 0;
      //Replace all instances of 360 with group.arc and Math.PI*2 with group.arc*Math.PI/180
      function raddiv (size, progress, gap, thickness, rot, delay, redflag) {
        var divrad = ((group.arc/group.div)-group.divwidth)*(Math.PI/180);//number and width of dividers remains the same for inners.
        var point = [];
        var prog = [];//should be independent to each function, ideally.
        var ir = [];
        var or = [];
        var it = [];
        var back = gr.append("path")
          .attr("d", function (d, i){
            barc = d3.svg.arc()
              .startAngle(rot)
              .endAngle(function (d, i){return (progress[i] <= 0) ? rot : rot+ radarc;})
              .innerRadius(function (d, i){
                if(!i){ir[i] = size-thickness;} else {
                  ir[i] = ir[i-1] - (gap+thickness);
                }//start with the initial size, decrease by gap and thickness each time
                if(i && Math.floor(group.progress[i-1]/100) && group.secondary){ir[i] -= thickness;}//and this if there's a secondary bar.
                return ir[i];})
              .outerRadius(function (d, i){
                if(!i){or[i] = size;} else {
                  or[i] = or[i-1] - (gap+thickness);
                }
                if(i && Math.floor(group.progress[i-1]/100) && group.secondary){or[i] -= thickness;}
                return or[i];});
            return barc(d, i);              
          })
          .attr("fill", function (d, i){
            var tt = backcolor(i);
            if(isNaN(tt.a) || !redflag){tt.a = group.backopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
          });
        if(!box){box = back.node().getBBox();}
        gr.append("path")
          .attr("d", function (d, i){
            curarc = d3.svg.arc()//just use this to set the desired points
              .startAngle(function (d, i){return point[i] = rot + group.divwidth*(Math.PI/360);})
              .endAngle(function (d, i){return point[i] + divrad;})
              .innerRadius(function (d, i){return ir[i];})
              .outerRadius(function (d, i){return or[i];})
              .cornerRadius(group.rounding);
            return curarc(d, i);
          })
          .attr("fill", function (d, i){
            var tt = color(i);
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+0+")";
          })
          .transition()
          .delay(function (d, i){it[i] = 0; return delay + it[i]*group.transition*1000/(group.div*progress[i]/100);})
          .duration(function (d, i){return group.transition*1000/(group.div*progress[i]/100);})
          .attr("fill", function (d, i){
            prog[i] = Math.min(progress[i]/100, 1);
            var ch = Math.min((prog[i])*group.div, 1);
            prog[i] -= (1/group.div);//decrease by divider fraction
            var tt = color(i);
            if(isNaN(tt.a)){tt.a = group.graphopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a*ch+")";
          })
          .each(function (e, i){return divi(e, i);});
        
        function divi (e, i){
          if(prog[i] > 0){
            it[i]++;
            point[i] += divrad + group.divwidth*(Math.PI/180);//add divwidth degrees along with starting on the next divider
            d3.select(gr[0][i]).append("path")//make a new divider
              .attr("d", function (d, ind){
                curarc = d3.svg.arc()
                  .startAngle(function (d){return point[i];})
                  .endAngle(function (d){return point[i] + divrad;})
                  .innerRadius(function (d){return ir[i];})
                  .outerRadius(function (d){return or[i];})
                  .cornerRadius(group.rounding);//size can also vary for the second loop.
                return curarc(d, ind);
              })
              .attr("fill", function (d){
                var tt = color(i);
                return "rgba("+tt.r+","+tt.g+","+tt.b+","+0+")";
              })
              .transition()
              .delay(function (d){return delay + it[i]*group.transition*1000/(group.div*progress[i]/100);})
              .duration(function (d){return group.transition*1000/(group.div*progress[i]/100);})
              .attr("fill", function (d){
                var ch = Math.min((prog[i])*group.div, 1);
                prog[i] -= (1/group.div);//decrease by divider fraction
                var tt = color(i);
                if(isNaN(tt.a)){tt.a = group.graphopacity;}
                return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a*ch+")";
              })
              .each(function (e){return divi(e, i);});
          }
        };
        var progtest = false;
        var np = [];
        for(var t = 0; t < progress.length; t++){
          np[t] = Math.max(progress[t] - 100, 0);
          if(!progtest && np[t] > 0){
            progtest = true;
          }
        }
        if(progtest){//figure out how to delay until when it actually hits 100.
          if(redflag){
            raddiv(size-thickness, np, gap, thickness, rot, delay+group.transition*800, false);
          } else {
            group.backopacity = 0;
            raddiv(size, np, gap, thickness, rot, delay+group.transition*800, false);
          }
        }
      };
      function raddi (size, progress, gap, thickness, rot, delay, redflag){
        var arcs = [];
        var ir = [];
        var or = [];
        back = gr.append("path")
          .attr("d", function (d, i){
            barc = d3.svg.arc()
              .startAngle(rot)
              .endAngle(function (d, i){return (progress[i] <= 0) ? rot : rot+radarc;})
              .innerRadius(function (d, i){
                if(!i){ir[i] = size-thickness;} else {
                  ir[i] = ir[i-1] - (gap+thickness);
                }//start with the initial size, decrease by gap and thickness each time
                if(i && Math.floor(group.progress[i-1]/100) && group.secondary){ir[i] -= thickness;}//and this if there's a secondary bar.
                return ir[i];})
              .outerRadius(function (d, i){
                if(!i){or[i] = size;} else {
                  or[i] = or[i-1] - (gap+thickness);
                }
                if(i && Math.floor(group.progress[i-1]/100) && group.secondary){or[i] -= thickness;}
                return or[i];});
            return barc(d, i);
          })
          .attr("fill", function (d, i){
            var tt = backcolor(i);
            if(isNaN(tt.a) || !redflag){tt.a = group.backopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
          });
        if(!box){box = back.node().getBBox();}
        gr.append("path")
          .attr("d", function (d, i){
            arcs[i] = d3.svg.arc()
              .startAngle(rot)
              .endAngle(rot)
              .innerRadius(function (d, i){return ir[i];})
              .outerRadius(function (d, i){return or[i];})
              .cornerRadius(group.rounding);
            return arcs[i](d, i);
          })
          .attr("fill", function (d, i){
            var tt = color(i);
            if(isNaN(tt.a)){tt.a = group.graphopacity;}
            return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
          })
          .transition(function (d, i){return "rad"+i;})
          .delay(delay)
          .duration(group.transition*1000)
          .attrTween("d", function (d, i){
            var ccc = progress[i]/100;
            if (ccc > 1){
              ccc = 1;
            }
            var itp = d3.interpolate(rot, rot + (radarc)*ccc);

            return function(t) {
              return arcs[i].endAngle(itp(t))(d, i);
            }
          });
        var progtest = false;
        var np = [];
        for(var t = 0; t < progress.length; t++){
          np[t] = progress[t] - 100;
          if(np[t]<0){np[t]=0;}
          if(!progtest && np[t] > 0){
            progtest = true;
          }
        }
        if(progtest){
          if(redflag){
            raddi(size-thickness, np, gap, thickness, rot, delay+group.transition*800, false);
          } else {
            group.backopacity = 0;
            raddi(size, np, gap, thickness, rot, delay+group.transition*800, false);
          }
        }
      };
      if(group.div){//nonzero divider set
        raddiv(group.graphsize, group.progress, group.gap, group.thickness, rot, 0, redfl);
      } else {
        raddi(group.graphsize, group.progress, group.gap, group.thickness, rot, 0, redfl);
      }
      var tranx = -box.x;
      var trany = -box.y;
        gr
          .attr("transform", "translate(" + (tranx) + "," + (trany) + ")");
      if(group.image){
        var bbox = svgd.node().getBBox();
        d3.select(gr[0][0]).append("svg:image")
          .attr("xlink:href", group.image.url)
          .attr('width', group.image.width)
          .attr('height', group.image.height)
          .attr('x', function (){
            switch(group.image.position.split(" ")[1]){
              case "right":
                return box.x + box.width;
                break;
              case "middle":
                return -group.image.width/2;
                break;
              case "left":
                return box.x - group.image.width;
                break;
            }
            return -group.image.width/2;
          })
          .attr('y', function (){
            switch(group.image.position.split(" ")[0]){
              case "bottom":
                return box.y + box.height;
                break;
              case "middle":
                return -group.image.height/2;
                break;
              case "top":
                return box.y -group.image.height;
                break;
            }
          });
      }
      if(group.labels != 'off'){
        var textwidth = [];
        fontsize = (group.graphsize/(5));
        var tx = 0;
        var ty = 0;
        switch(group.labels.split(" ")[0]){
          case "bottom":
            ty = box.y + box.height + (fontsize-1)*group.goal.length;
            break;
          case "middle":
            ty = fontsize*(2/3) - (fontsize-1)*group.goal.length/2;
            break;
          case "top":
            ty = box.y - (fontsize-1)*(group.goal.length-1);
            break;
        }
        switch(group.labels.split(" ")[1]){
          case "right":
            tx = box.x+box.width;
            break;
          case "middle":
            tx = 0;
            break;
          case "left":
            tx = box.x;
            break;
        }
        var text = gr.append("text")
          .attr("x", tx)
          .attr("y", function (d, i){return (group.labels.startsWith("bottom")) ? ty - (fontsize-1)*i : ty + (fontsize-1)*i;})
          .text(function (d, i){
            if (group.text.length == 1){
              return group.text[0]
                  .replace(/%percent/g, group.progress[i].toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, group.current[i].toFixed(group.dec[i])+'/'+group.goal[i].toFixed(group.dec[i]))
                  .replace(/%goal/g, group.goal[i].toFixed(group.dec[i]))
                  .replace(/%value/g, group.current[i].toFixed(group.dec[i]));
            } else {
              return group.text[i]
                  .replace(/%percent/g, group.progress[i].toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, group.current[i].toFixed(group.dec[i])+'/'+group.goal[i].toFixed(group.dec[i]))
                  .replace(/%goal/g, group.goal[i].toFixed(group.dec[i]))
                  .replace(/%value/g, group.current[i].toFixed(group.dec[i]));
            }
          })
          .attr("text-anchor", (!tx) ? "middle" : (group.labels.endsWith('left')) ? "end" : "start")
          .style("font-size", fontsize+"px")
          .call(styles, group.style)
          .each(function (d, i){
            textwidth[i] = this.getBBox().width;
          })//need this to put the key in the right place.
          .transition(function (d, i){return "radt"+i;})
          .duration(group.transition*1000)
          .tween("text", function (d, i, a){
            var iprog = d3.interpolate(0, group.progress[i]);
            var ival = d3.interpolate(0, group.current[i]);
            var igoal = d3.interpolate(0, group.goal[i]);
            return function (t){
              if(group.text.length == 1){
                this.textContent = group.text[0]
                  .replace(/%percent/g, +iprog(t).toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, (+(ival(t).toFixed(group.dec[i]))) + "/" + (+(igoal(t).toFixed(group.dec[i]))))
                  .replace(/%goal/g, +(igoal(t).toFixed(group.dec[i])))
                  .replace(/%value/g, +(ival(t).toFixed(group.dec[i])));
              } else {
                this.textContent = group.text[i]
                  .replace(/%percent/g, +iprog(t).toFixed(group.dec[i])+'%')
                  .replace(/%fraction/g, (+(ival(t).toFixed(group.dec[i]))) + "/" + (+(igoal(t).toFixed(group.dec[i]))))
                  .replace(/%goal/g, +(igoal(t).toFixed(group.dec[i])))
                  .replace(/%value/g, +(ival(t).toFixed(group.dec[i])));
              }
            }
          });
        /*if(group.key){
          gr.append("circle")
            .attr('r', (fontsize)/3)
            .attr('cx', function (d, i){
              if (group.labels.endsWith("left")){//anchored left
                return tx - textwidth[i] - fontsize/3;
              } else if (group.labels.endsWith("right")){//anchored right
                return tx - fontsize/3;
              } else {//anchored center
                return tx - textwidth[i]/2 - fontsize/3;
              }
            })
            .attr('cy', function (d, i){
              return (group.labels.startsWith("bottom")) ? -fontsize/3 + ty - (fontsize-1)*i : -fontsize/3 + ty + (fontsize-1)*i;
            })
            .attr("fill", function (d, i){
              var tt = color(i);
              if(isNaN(tt.a)){tt.a = group.graphopacity;}
              return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
            });
          if(group.labels.endsWith("right")){
            gr.selectAll("text")
              .attr("transform", "translate(" + (fontsize*2/3) + "," + 0 + ")");
            gr.selectAll("circle")
              .attr("transform", "translate(" + (fontsize*2/3) + "," + 0 + ")");
          }
        }*/
        if(group.key){
          var labkey = gr.append("rect")
            .attr('width', (fontsize)/2)
            .attr('height', (fontsize)/2)
            .attr('x', function (d, i){
              if (group.labels.endsWith("left")){//anchored left
                return tx - textwidth[i] - fontsize/2;
              } else if (group.labels.endsWith("right")){//anchored right
                return tx - fontsize/2;
              } else {//anchored center
                return tx - textwidth[i]/2 - fontsize/2;
              }
            })
            .attr('y', function (d, i){
              return (group.labels.startsWith("bottom")) ? -5*fontsize/8 + ty - (fontsize-1)*i : -5*fontsize/8 + ty + (fontsize-1)*i;
            })
            .attr("fill", function (d, i){
              var tt = color(i);
              if(isNaN(tt.a)){tt.a = group.graphopacity;}
              return "rgba("+tt.r+","+tt.g+","+tt.b+","+tt.a+")";
            });
          if(group.labels.endsWith("right")){
            gr.selectAll("text")
              .attr("transform", "translate(" + (fontsize*2/3) + "," + 0 + ")");
            labkey
              .attr("transform", "translate(" + (fontsize*2/3) + "," + 0 + ")");
          }
        }
      }
      gr
        .attr("transform", "translate(" + (-svgd.node().getBBox().x-box.x) + "," + (-svgd.node().getBBox().y-box.y) + ")");
      svgd
        .attr("height", svgd.node().getBBox().height + "px")
        .attr("width", svgd.node().getBBox().width + "px");
    }
  }
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  return {
    update: update,
    capture: capture,
  };
})();

