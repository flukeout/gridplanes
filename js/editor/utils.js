// Cool utility functions

// Distance from a point to a line segment
// p    = point {x,y}
// v, w = start and and points {x,y}, {x,y}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }

function distPoints(v, w) { 
  let deltaX = w.x - v.x;
  let deltaY = w.y - v.y;
  return Math.sqrt(Math.pow(deltaX,2 ) + Math.pow(deltaY ,2));

}


function getRandom(min, max){
  return min + Math.random() * (max-min);
}

// Check if a point is within a polygon
// * point   = [x,y]
// * polygon = [[x,y], [x,y], [x,y]]
function testWithin(point, vs) {

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function getRandom(min, max){
  return min + Math.random() * (max-min);
}


const comparePoints = (point, otherPoint) => {
  return point.x == otherPoint.x && point.y == otherPoint.y;
}

const dQ = (selector) => {
  return document.querySelector(selector);
}



const getMidpoint = (points) => {

  let bounds = points.reduce((bounds, point) => {
    if(point.x < bounds.minX) {
      bounds.minX = point.x;
    }
    if(point.x > bounds.maxX) {
      bounds.maxX = point.x;
    }
    if(point.y > bounds.maxY) {
      bounds.maxY = point.y;
    }
    if(point.y < bounds.minY) {
      bounds.minY = point.y;
    }
    return bounds;
  }, {
    minX : points[0].x,
    maxX : points[0].x,
    minY : points[0].y,
    maxY : points[0].y
  });

  return {
    x : bounds.minX + (bounds.maxX - bounds.minX) / 2,
    y : bounds.minY + (bounds.maxY - bounds.minY) / 2
  }

}

function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// Removes a point or grid from an array, including its
// * uiEl
// * svgEl
const customFilter = (items, conditional) => {
  return items.filter(item => {
    let killItem = conditional(item);
    if(killItem == true) {
      if(item.svgEl) {
        item.svgEl.remove();
      }
      if(item.uiEl) {
        item.uiEl.remove();
      }
    }
    return !killItem;
  });
}

const makeSvg = (type = "polygon", options = {}, appendEl) => {
  let svgEl = document.createElementNS("http://www.w3.org/2000/svg", type);
  Object.keys(options).forEach(key => {
    svgEl.setAttribute(key, options[key]);
  });
  document.querySelector(appendEl).appendChild(svgEl);
  return svgEl;
}

const createGrid = (points, options) => {
  // console.log("cg",points);
  let newGrid = new Grid(points);
  Object.keys(options).forEach(key => newGrid[key] = options[key]);
  return newGrid;
}

const highestZIndexItem = items => {
  let sortedItems  = items.sort((a,b) => {
    return a.zIndex < b.zIndex ? 1 : -1;
  });
  return sortedItems[0];
}


const deselectGrids = () => {
  console.log("deselectGrids()");
  grids = grids.map(grid => {
    grid.selected = false;
    return grid;
  });
}

const deselectPoints = () => {
  points = points.map(point => {
    point.selected = false;
    point.hovered = false;
    point.stickyHovered = false;
    return point;
  });
}


const roundPoints = () => {
  points = points.map(p => {
    p.x = Math.round(p.x);
    p.y = Math.round(p.y);
    return p;
  })
}

const createPoint = p => {

  let group = document.createElementNS("http://www.w3.org/2000/svg","svg");
  group.setAttribute("x", p.x);
  group.setAttribute("y", p.y);

  let circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  circle.setAttribute("cx", 0);
  circle.classList.add("bigcircle");
  circle.setAttribute("cy", 0);
  circle.setAttribute("r", 14);
  circle.setAttribute("stroke", "transparent");
  circle.setAttribute("stroke-width", 2);
  circle.setAttribute("fill", "transparent");

  let smallCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  smallCircle.classList.add("smallcircle");
  smallCircle.setAttribute("cx", 0);
  smallCircle.setAttribute("cy", 0);
  smallCircle.setAttribute("r", 3);
  smallCircle.setAttribute("fill", "transparent");

  group.append(circle);
  group.append(smallCircle);

  svgPoints.appendChild(group);

  return {
      x : p.x,
      y : p.y,
      svgEl : group
  }
}


const mergeSamePoints = () => {
  points = points.map(p => {
    points.map(otherP => {
      if(p != otherP) {
        let distance = Math.sqrt(Math.pow(p.x - otherP.x, 2) + Math.pow(p.y - otherP.y, 2));
        if(distance <= mergeDistance) {
          p.x = otherP.x;
          p.y = otherP.y;
        }
      }
    })
    return p;
  });
}



// Check if there are any overlapping points...
const consolidatePoints = () => {

  let x, y;
  let haveNewPoint = false;

  let samePoints = points.filter(thisPoint => {
    for(var i = 0; i < points.length; i++) {
      let otherPoint = points[i];
      if(otherPoint != thisPoint) {
        if(otherPoint.x == thisPoint.x && otherPoint.y == thisPoint.y) {
          x = thisPoint.x;
          y = thisPoint.y;
          haveNewPoint = true;
          return thisPoint;
        }
      }
    }
  });

  if(haveNewPoint == false) {
    return;
  }

  // replace with new reference...
  let newPoint = { x: x, y: y};
  newPoint = createPoint(newPoint);
  newPoint.new = true;
  let alreadyReturned;

  // this does NOT update the 'grids value'
  // might as well do it the mapped way...

  points = points.filter(p => {
    if(p.x == newPoint.x && p.y == newPoint.y) {
      p.svgEl.remove();
      return false;
    } else {
      return true;
    }
  });

  grids = grids.map(grid => {
    grid.points = grid.points.map(p => {
      if(p.x == newPoint.x && p.y == newPoint.y) {
        return newPoint;
      } else {
        return p;
      }
    });

    return grid;
  })

  points.push(newPoint);
}

const killGhosts = () => {
  if(clonedGrid.grid) {
    clonedGrid.grid.click();
  }
  clonedGrid.grid = false;
  grids = customFilter(grids, (g => g.mode === "ghost" || g.mode === "invisible"));
  
}


// Get rid of shapes with 2 or fewer points
// If a shape has two points that are the same..., consolidate those too?
const cleanupGrids = () => {

  // Get rid of shapes in a grid that don't exist in the points array
  grids = grids.map(grid => {
    grid.points = customFilter(grid.points, (p => points.indexOf(p) === -1));
    return grid;
  });
  
  // Filter out duplicate points from grids
  grids = grids.map(grid => {
    
    let dupeIndexes = [];

    for(var i = 0; i < grid.points.length; i++) {
      let thisPoint = grid.points[i];
      for(var j = 0; j < grid.points.length; j++) {
        let otherPoint = grid.points[j];
        if(i != j && thisPoint == otherPoint) {
          if(dupeIndexes.indexOf(i) < 0 && dupeIndexes.indexOf(j) < 0) {
            dupeIndexes.push(i);
          }
        }
      }
    }

    let mapIndex = -1;
    grid.points = grid.points.filter(p => {
      mapIndex++;
      if(dupeIndexes.indexOf(mapIndex) > -1) {
        return false;
      } else {
        return true;
      }
    })
    return grid;
  })

  // Get rid of shapes that have fewer than 3 pints
  grids = customFilter(grids, (grid => grid.points.length < 3));
}

// Filter out points that aren't associated with any shapes
const cleanupPoints = () => {
  points = points.filter(p => {
    let contained = false;
    for(var i = 0; i < grids.length; i++) {
      let gridPoints = grids[i].points;
      if(gridPoints.includes(p)) {
        contained = true;
      }
    }
    if(contained == false) {
      p.svgEl.remove();
    }
    return contained;
  });
}

const deleteSelected = () => {
  let anythingSelected = false;

  points.map(p => {
    if(p.selected) {
      anythingSelected = true;
    }
  });

  grids.map(g => {
    if(g.selected) {
      anythingSelected = true;
    }
  })

  if(anythingSelected) {
    pushHistory();
  }

  points = customFilter(points, (p => p.selected));
  deleteSelectedGrids();
}
