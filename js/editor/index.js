// Basic Config
let canvasWidth = svgImage.getBoundingClientRect().width;
let canvasHeight = svgImage.getBoundingClientRect().height;

let cloning = false;
let cloners = [];
let wobble = false;
let pointSelected = false;
let gridSelected = false;
let newGrid;
let clickedGrids;
let distanceTraveled;

let clonedGrid = {
  newGrid : "",
  startPoint : {
    x : 0,
    y : 0
  },
  distanceTraveled : 0
}

window.addEventListener("mousedown", e => {
  mouse.pressedAnywhere = true;
  frameLoop();
});

svgScene.addEventListener("mousedown", (e) => {

  mouse.pressed = true;
  cloning = false;
  clickedGrids = [];

  if(selectedTool == "paintbrush") {
    clickedGrids = [];
    grids.map(grid => { 
      if(grid.hovered) {
        clickedGrids.push(grid)
      }
    });
    if(clickedGrids.length >0 ) {
      pushHistory();
      highestZIndexItem(clickedGrids).fillColorIndex = selectedColorIndex;
    }
  }

  if(selectedTool == "creator") {
    toolCreate.mouseDown(e);
  }

  if(selectedTool == "selector") {

    cloners = [];
    cloning = false;

    pointSelected = false;
    gridSelected = false;

    let gridClicked = false;
    let clickedSelectedPoint = false;

    // Check if we are clicking a selected
    points.map(p => {
      if(p.hovered && p.selected) {
        clickedSelectedPoint = true;
      }
    });

    // If a non-selected point is clicked
    // clear all selected points.
    if(clickedSelectedPoint == false && mouse.shiftPressed == false) {
      points = points.map(p => {
        p.selected = false;
        return p;
      });
    }

    // Select clicked point.
    points = points.map(p => {
      if(p.hovered) {
        p.selected = true;
        pointSelected = true;
      } 
      return p;
    });

    if(pointSelected == false && mouse.shiftPressed == false) {
      points = points.map(p => {
        p.selected = false;
        p.hovered = false;
        return p;
      });
    }


    // If no points are selected
    if(pointSelected == false) {

        clickedGrids = [];

        clickedGrids = grids.filter(grid => grid.hovered);

        if(mouse.shiftPressed == false ) {
          deselectGrids();
        }

        grids.map(grid => {

          // Figure out segment hovering - !
          for(var i = 0; i < grid.points.length; i++){

            let thisP = grid.points[i];
            let nextP = grid.points[i + 1];
            let start, end, dist;
            dist = 0;
            
            if(!nextP) {
              nextP = grid.points[0];
            }

            start = {x: thisP.x, y: thisP.y};
            end = {x: nextP.x, y: nextP.y};

            dist = distToSegment({x : mouse.x, y : mouse.y}, start, end);

            if(dist <= lineHoverDistance) {
              if(cloners.length < 2) {
                console.log("starting a clone here");
                cloners.push(thisP);
                cloners.push(nextP);
              }
            }
          }
        }); // end grid.map...

        // Click the Grid with the highest z index
        if(clickedGrids.length > 0 && cloners.length === 0) {
          highestZIndexItem(clickedGrids).click();
          gridClicked = true;
        }

    } else {
        deselectGrids();
    }

    if(pointSelected == false) {
      mouse.dragging = true;
      mouse.dragZone.start.x = e.offsetX;
      mouse.dragZone.start.y = e.offsetY;
      mouse.dragZone.end.x = e.offsetX;
      mouse.dragZone.end.y = e.offsetY;
    }

    // For cloning
    if(cloners.length == 2 && pointSelected == false && mouse.shiftPressed == false) {
      
      deselectGrids();
      deselectPoints();
      frameLoop();
      cloning = true;

      // Add new points to the points array
      let newPoints = [];
      let newOne, newTwo;

      if(settings.extrudeMode == "line") {
        newOne = { x: parseInt(cloners[0].x), y: parseInt(cloners[0].y)}
        newTwo = { x: parseInt(cloners[1].x), y: parseInt(cloners[1].y)}

        newOne = createPoint(newOne);
        newTwo = createPoint(newTwo);

        newOne.cloning = true;
        newTwo.cloning = true;

        points.push(newTwo);
        points.push(newOne);
        newPoints.push(newTwo);
        newPoints.push(newOne);
        
      } else if (settings.extrudeMode == "point") {
        newOne = { x: parseInt(mouse.x), y: parseInt(mouse.y)}

        newOne = createPoint(newOne);
        newOne.cloning = true;

        points.push(newOne);
        newPoints.push(newOne);
      }

      newPoints.push(cloners[0]);
      newPoints.push(cloners[1]);

      mouse.dragging = false;

      // Create a grid tile from it
      let newGrid = createGrid(newPoints, {
        fillColorIndex : selectedColorIndex,
        mode : "invisible"
      });

      // Keep track of the cloned grid...
      clonedGrid.grid = newGrid;
      clonedGrid.distanceTraveled = 0;
      clonedGrid.startPoint.x = parseInt(mouse.x);
      clonedGrid.startPoint.y = parseInt(mouse.y);

      pushHistory();

      grids.push(newGrid);
    }
  }

  snapshotTaken = false;

});


window.addEventListener("mousemove", (e) => {

  if(mouse.pressed && snapshotTaken == false && clonedGrid.grid == false) {
    pushHistory();
    snapshotTaken = true;
  }

  let dX =  e.clientX - mouse.x;
  let dY =  e.clientY - mouse.y;

  if(selectedTool === "creator" && mouse.pressed == true) {
    toolCreate.mouseMove(e);
  }

  if(selectedTool === "selector") {

    if(clonedGrid.grid) {
      let cloneDist = distPoints(clonedGrid.startPoint, { x: mouse.x, y : mouse.y});
      console.log(cloneDist);
      if(cloneDist > 18) {
        clonedGrid.grid.mode = "normal";
      } else {
        clonedGrid.grid.mode = "ghost";
      }
    }

    if(mouse.dragging) {
      mouse.dragZone.end.x += dX;
      mouse.dragZone.end.y += dY;
    }

    points = points.map(p => {

      if(mouse.dragging) {
        p.hovered = false;
        p.stickyHovered = checkDragZone(p);
      } else {
        let distance = Math.sqrt(Math.pow(p.x - mouse.x, 2) + Math.pow(p.y - mouse.y, 2));

        if(distance < hoverRadius) {
          p.hovered = true;
        } else {
          p.hovered = false;
        }
      }

      if((p.selected || p.cloning) && mouse.pressed && mouse.shiftPressed == false) {
        p.x += dX;
        p.y += dY;
        moveSticky(dX,dY);
      }

      return p;
    });
  }

  if(selectedTool === "move" && mouse.pressed) {
    points = points.map(p => {
      p.x += dX;
      p.y += dY;
      return p;
   });
  }

  if(selectedTool === "paintbrush" && mouse.pressed) {
    clickedGrids = [];
    grids.map(grid => { 
      if(grid.hovered) {
        clickedGrids.push(grid)
      }
    });
    if(clickedGrids.length > 0) {
      highestZIndexItem(clickedGrids).fillColorIndex = selectedColorIndex;
    }
  }

  mouse.x = e.clientX;
  mouse.y = e.clientY;

  frameLoop();
});

// Deselect all points on mouseup
window.addEventListener("mouseup", (e) => {
  mouse.pressed = false;
  mouse.dragging = false;
  mouse.pressedAnywhere = false;
  
  // If we were cloning, but didn't create a new grid,
  // select the original grid we clicked instead.
  if(cloning && clickedGrids.length > 0) {
    if(clonedGrid.grid.mode == "invisible") {
      highestZIndexItem(clickedGrids).click();  
    }
  }

  // SVG
  dragSvg.remove();
  dragSvg = false;
  cloning = false;

  points = points.map(p => {
    if(p.stickyHovered) {
      p.stickyHovered = false;
      p.selected = true;
    }
    p.cloning = false;
    return p;
  });

  if(selectedTool === "creator") {
    toolCreate.mouseUp(e);
  }

  roundPoints();
  frameLoop();
});

const moveSticky = (dX, dY) => {
   points = points.map(p => {
      if(p.stickyHovered && !p.selected) {
        p.x += dX;
        p.y += dY;
      }
      return p;
  });
}

const deleteSelectedGrids = () => {
  grids = customFilter(grids, (g => g.selected));
}

window.addEventListener("keyup", e => {
  let key = getKey(e.keyCode);
});


let frameCount = 0;
let hoveredVertex = false;
let hoveredSegments;
let hoveredGrids;

const frameLoop = () => {
  
  if(mouse.pressed == false && mouse.pressedAnywhere == false) {
    killGhosts();        // Kill shapes that are ghosts
    cleanupPoints();     // Get rid of orphan points
    mergeSamePoints();   // Make points close to each other have the same x,y values
    consolidatePoints(); // Make points with same x,y be the same points
    cleanupGrids();      // Throw out grids with less than 3 points
    cleanupPoints();     // Get rid of orphan points
  }

  hoveredVertex = false;
  frameCount++;

  // if(mouse.pressed == false && wobble) {
  //   points = points.map(p => {
  //     let delta = Math.sin(p.x/100 + frameCount/10) * 10;
  //     p.delta = delta;
  //     p.y = p.y + delta;
  //     return p;
  //   })
  // }

  hoveredSegments = [];
  hoveredGrids = [];
  // Get all the hover segments

  if(selectedTool == "selector" || selectedTool == "paintbrush") {
    grids.map(grid => {
      if(mouse.shiftPressed == false) {
        grid.checkHoverSegments();  
      }
      if(grid.hovered) {
        hoveredGrids.push(grid);
      }
    });
  }


  
  grids.map(grid => {
    grid.showHover = hoveredSegments.length > 0 ? false : true;
    grid.checkShapeHover(); // sets 'grid.hovered'
    grid.showHovered = false;

    if(hoveredGrids.length > 0) {
      hoveredGrids = hoveredGrids.sort((a,b) => {
        return a.zIndex < b.zIndex ? 1 : -1;
      });
      hoveredGrids[0].showHovered = true;
    }

    if(selectedTool == "paintbrush") {
      grid.showHover = true;
    }

    if(mouse.dragging || cloning) {
      grid.showHover = false;
    }

    grid.canvasDraw();
  });

  points.map(p => drawVertex(p)); // These are just UI points

  // Draw the hovered line segment closest ot pointer
  let showHoverSegment = true;
  if(selectedTool === "selector" && cloning == true) {
    showHoverSegment = false;
  }

  drawHoverSegment(showHoverSegment);

  if(hoverSegmentSvg) {
    if(hoveredVertex == true) {
      hoverSegmentSvg.setAttribute("stroke", "none");
    }
  }

  if(mouse.pressed == false && wobble) {
    points = points.map(p => {
      p.y = p.y - p.delta;
      p.delta = 0;
      return p;
    })
  }



  drawDragZone();
  // requestAnimationFrame(frameLoop);
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

let dragSvg = false;

const drawDragZone = () => {

  if(dragSvg == false) {
    let attributes = {
      "fill" : "rgba(255,0,0,.2)"
    }
    dragSvg = makeSvg("polygon", attributes, ".svg-points");
  }

  if(mouse.dragging) {

    let dragPoints = [
      {
        x: mouse.dragZone.start.x,
        y: mouse.dragZone.start.y
      },{
        x: mouse.dragZone.end.x,
        y: mouse.dragZone.start.y
      },{
        x: mouse.dragZone.end.x,
        y: mouse.dragZone.end.y
      },{
        x: mouse.dragZone.start.x,
        y: mouse.dragZone.end.y
      },
    ]

    // SVG
    let pointsString = dragPoints.reduce((string, point) => {
      return string + parseInt(point.x) + "," + parseInt(point.y) + " ";
    }, "");
    dragSvg.setAttribute("points", pointsString);
  }
}

const checkDragZone = p => {
  let startX  = Math.min(mouse.dragZone.start.x, mouse.dragZone.end.x);
  let endX    = Math.max(mouse.dragZone.start.x, mouse.dragZone.end.x);
  let startY  = Math.min(mouse.dragZone.start.y, mouse.dragZone.end.y);
  let endY    = Math.max(mouse.dragZone.start.y, mouse.dragZone.end.y);

  return (
     p.x > startX
  && p.x < endX
  && p.y > startY
  && p.y < endY
  )
}

const start = () => {
  let picture = window.localStorage.getItem("picture");
  let loaded = loadPicture(JSON.parse(picture));

  if(loaded == false) {
    resetPicture();
  }

  frameLoop();
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

start();