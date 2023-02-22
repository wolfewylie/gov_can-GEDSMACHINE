const fs = require('fs')
const {MiroApi} = require('@mirohq/miro-api')
const api = new MiroApi('***KEY***')
boardId = ""
let board = {}
let govData = {}

fs.readFile('govTree.json', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`)
  } else {
    // parse JSON string to JSON object
    govData = JSON.parse(data)
    // console.log(Object.keys(govData['Canada']['Employment and Social Development Canada']));
  }
})

function makeSticky(stickyData) {
    let tempSticky = board.createStickyNoteItem(stickyData)
    return tempSticky
}

function makeTag(tagData) {
    let tempTag = board.createTag(tagData)
    return tempTag
}

function createShape(shapeData) {
    let tempShape = board.createShapeItem(shapeData);
    return tempShape
}


const app = (async function () {
  board = await api.getBoard('***TOKEN***')
    //   KILL TAGS FUNCTION TO KEEP HANDY
    // for await (const tag of await board.getAllTags()) {
    //   const tagtoKill = await board.getTag(tag.id)
    //   tagtoKill.delete()
    // }

//   const tag = await makeTag({
//     fillColor: "red",
//     title: "I'm a tag!",
//     });

    // This will draw one department horizontaly 
    async function drawHorizontal(departmentName, horizontalOffset) {
        let baseWidth = 87;
        let baseHeight = 212;
        let baseBuffer = 12;
    
        let stickyHeight = 27;
        let stickyBuffer = 5;
        let count = 0;
    
        let departmentFontSize = '36';
        let secondaryFontSize = '13'
    
        total_offset = horizontalOffset
        for (const department in govData['Canada']['childOrgs'][departmentName]['childOrgs']) {
            let element = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department] 
            let departmentChildLength = Object.keys(element['childOrgs']).length; 
            secondary_depth_child_orgs = 0
            for (each_branch in element['childOrgs']) {
                secondary_depth_child_orgs = secondary_depth_child_orgs + Object.keys(element['childOrgs'][each_branch]['childOrgs']).length
            } 
            let deptShapeWidth = (baseWidth * departmentChildLength) + (secondary_depth_child_orgs * (baseWidth + baseBuffer)) + (baseBuffer * secondary_depth_child_orgs) + (baseBuffer * departmentChildLength);
            if (departmentChildLength == 0) {
                deptShapeWidth = 1500
            }
            let departmentShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: department + " (" + element.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        x: total_offset + baseBuffer + (deptShapeWidth / 2), 
                        y: 0
                    },
                    geometry: {height: baseHeight, width: deptShapeWidth},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: departmentFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
    
            let subCount = 0;
            let branch_offset = 0
            for (branch_node in govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs']) {
                const branch = govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node];
                let branchChildLength = Object.keys(branch['childOrgs']).length;  
                let secondary_branch_length = 0;
                for (each_secondary_branch in branch['childOrgs']) {
                    if (secondary_branch_length < Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length) {
                        secondary_branch_length = Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length;
                    }
                } 
                let shapeWidth = baseWidth + (branchChildLength * (baseWidth + baseBuffer)) + (baseBuffer * branchChildLength);
                let shapeHeight = (baseHeight * 3) + (baseHeight * secondary_branch_length) + (baseBuffer * secondary_branch_length) + baseHeight / 2;
                let branchShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: branch.name + " (" + branch.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        x: total_offset + branch_offset + baseBuffer + (shapeWidth / 2), 
                        // y: baseHeight + baseBuffer
                        y: baseHeight + (baseBuffer * 4)
                    },
                    geometry: {height: baseHeight + baseBuffer, width: shapeWidth},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: secondaryFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
                subCount++
                let divisionCount = 1;
                let division_offset = 0;
                for (division_node in govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs']) {
                    const division = govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]
                    final_depth_child_orgs = Object.keys(govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // final_depth_child_orgs = 1
                    // for (each_team in govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                    //     final_depth_child_orgs = final_depth_child_orgs + Object.keys(govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // } 
                    // console.log()
                    let division_shape_height = (stickyHeight * final_depth_child_orgs) + (baseBuffer * final_depth_child_orgs) + baseHeight / 2;;
                    let divisionTicket = await createShape({
                        data: {
                            shape: 'round_rectangle',
                            content: division.name + " (" + division.population + " people)"
                        },
                        position: {
                            origin: 'center', 
                            x: (baseWidth * divisionCount) + total_offset + division_offset + branch_offset + (baseBuffer * divisionCount), 
                            y: (division_shape_height / 2) + (baseHeight * 2) - (baseBuffer * 1)
                        },
                        geometry: {height: division_shape_height, width: baseWidth},
                        style: {
                            borderOpacity: '0.8',
                            color: '#1a1a1a',
                            fillColor: '#8fd14f',
                            fillOpacity: '0.4',
                            fontFamily: 'open_sans',
                            fontSize: secondaryFontSize,
                            textAlign: 'center',
                            textAlignVertical: 'top'
                        },
                    })
    
                    teamCount = 1;
                    for (each_unit in govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                        team_details = govData['Canada']['childOrgs']['Employment and Social Development Canada']['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs'][each_unit]
                        
                        let teamLabel = makeSticky({
                            data: {
                                shape: 'square', 
                                content: team_details.name + " (" + team_details.population + " people)"
                            },
                            style: {
                                fillColor: 'light_yellow',
                                textAlign: 'left',
                                textAlignVertical: 'middle'
                            },
                            position: {
                                origin: 'center', 
                                x: (baseWidth * divisionCount) + total_offset + division_offset + branch_offset + (baseBuffer * divisionCount), 
                                y: (baseHeight * 2 + stickyHeight * 3) + (stickyHeight * teamCount) + (stickyBuffer * teamCount) 
                            },
                            geometry: {
                                height: stickyHeight
                            }
                        })
                        teamCount++
                    }
    
                    divisionCount++
    
                }
                division_offset = division_offset + baseWidth + baseBuffer
                branch_offset = branch_offset + shapeWidth + baseBuffer
    
                count++
            }
            total_offset = total_offset + deptShapeWidth + baseBuffer;
        }
    }
    
    //This one will draw the department vertically
    async function drawVertical(departmentName, horizontalOffset, verticalOffset) {
        let baseHeight = 87;
        let baseWidth = 212;
        let baseBuffer = 12;
    
        let stickyHeight = 27;
        let stickyBuffer = 5;
        let count = 0;
    
        let departmentFontSize = '36';
        let secondaryFontSize = '13'
    
        total_vertical_offset = verticalOffset
        total_horizontal_offset = horizontalOffset
        for (const department in govData['Canada']['childOrgs'][departmentName]['childOrgs']) {
            let element = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department] 
            let departmentChildLength = Object.keys(element['childOrgs']).length; 
            secondary_depth_child_orgs = 0
            for (each_branch in element['childOrgs']) {
                secondary_depth_child_orgs = secondary_depth_child_orgs + Object.keys(element['childOrgs'][each_branch]['childOrgs']).length
            } 
            let deptShapeHeight = (baseHeight * departmentChildLength) + (secondary_depth_child_orgs * (baseHeight + baseBuffer)) + (baseBuffer * secondary_depth_child_orgs) + (baseBuffer * departmentChildLength);
            if (departmentChildLength == 0) {
                deptShapeHeight = 1500
            }
            let departmentShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: department + " (" + element.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        y: total_vertical_offset + baseBuffer + (deptShapeHeight / 2), 
                        x: total_horizontal_offset
                    },
                    geometry: {width: baseWidth, height: deptShapeHeight},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: departmentFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
    
            let subCount = 0;
            let branch_offset = 0
            for (branch_node in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs']) {
                const branch = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node];
                let branchChildLength = Object.keys(branch['childOrgs']).length;  
                let secondary_branch_length = 0;
                for (each_secondary_branch in branch['childOrgs']) {
                    if (secondary_branch_length < Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length) {
                        secondary_branch_length = Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length;
                    }
                } 
                let shapeHeight = baseHeight + (branchChildLength * (baseHeight + baseBuffer)) + (baseBuffer * branchChildLength);
                let branchShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: branch.name + " (" + branch.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        y: total_vertical_offset + branch_offset + baseBuffer + (shapeHeight / 2), 
                        // y: baseHeight + baseBuffer
                        x: total_horizontal_offset + (baseWidth + (baseBuffer * 4))
                    },
                    geometry: {width: baseWidth + baseBuffer, height: shapeHeight},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: secondaryFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
                subCount++
                let divisionCount = 1;
                let division_offset = 0;
                for (division_node in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs']) {
                    const division = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]
                    final_depth_child_orgs = Object.keys(govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // final_depth_child_orgs = 1
                    // for (each_team in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                    //     final_depth_child_orgs = final_depth_child_orgs + Object.keys(govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // } 
                    // console.log()
                    let division_shape_width = (stickyHeight * final_depth_child_orgs) + (baseBuffer * final_depth_child_orgs) + baseWidth / 2;;
                    let divisionTicket = await createShape({
                        data: {
                            shape: 'round_rectangle',
                            content: division.name + " (" + division.population + " people)"
                        },
                        position: {
                            origin: 'center', 
                            y: (baseHeight * divisionCount) + total_vertical_offset + division_offset + branch_offset + (baseBuffer * divisionCount), 
                            x: total_horizontal_offset + ((division_shape_width / 2) + (baseWidth * 2) - (baseBuffer * 1))
                        },
                        geometry: {width: division_shape_width, height: baseHeight},
                        style: {
                            borderOpacity: '0.8',
                            color: '#1a1a1a',
                            fillColor: '#8fd14f',
                            fillOpacity: '0.4',
                            fontFamily: 'open_sans',
                            fontSize: secondaryFontSize,
                            textAlign: 'center',
                            textAlignVertical: 'top'
                        },
                    })
    
                    teamCount = 1;
                    for (each_unit in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                        team_details = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs'][each_unit]
                        
                        let teamLabel = makeSticky({
                            data: {
                                shape: 'square', 
                                content: team_details.name + " (" + team_details.population + " people)"
                            },
                            style: {
                                fillColor: 'light_yellow',
                                textAlign: 'left',
                                textAlignVertical: 'middle'
                            },
                            position: {
                                origin: 'center', 
                                y: (baseHeight * divisionCount) + total_vertical_offset + baseBuffer + division_offset + branch_offset + (baseBuffer * divisionCount), 
                                x: total_horizontal_offset + ((baseWidth * 2) + (stickyHeight * teamCount) + (stickyBuffer * teamCount))
                            },
                            geometry: {
                                height: stickyHeight
                            }
                        })
                        teamCount++
                    }
    
                    divisionCount++
    
                }
                division_offset = division_offset + baseHeight + baseBuffer
                branch_offset = branch_offset + shapeHeight + baseBuffer
    
                count++
            }
            total_vertical_offset = total_vertical_offset + deptShapeHeight + baseBuffer;
        }
       const department_title = await board.createTextItem({
                data: {
                    content: departmentName},
            style: {
                color: '#1a1a1a',
                fillColor: '#ffffff',
                fillOpacity: '0',
                fontFamily: 'open_sans',
                fontSize: '288',
                textAlign: 'center'
            },
            position: {
                origin: 'center', 
                x: horizontalOffset - baseWidth - baseBuffer, 
                y: baseWidth / 2
            },
            geometry: {
                rotation: -90, 
                width: baseWidth * 3
            }
        })
    }
    
    //This is the same as the drawVertical but flipped along the Y axis so it draws to the left instead of the right.
    async function drawInvertedVertical(departmentName, horizontalOffset, verticalOffset) {
        let baseHeight = 87;
        let baseWidth = 212;
        let baseBuffer = 12;
    
        let stickyHeight = 27;
        let stickyBuffer = 5;
        let count = 0;
    
        let departmentFontSize = '36';
        let secondaryFontSize = '13'
    
        total_vertical_offset = verticalOffset
        total_horizontal_offset = horizontalOffset
        for (const department in govData['Canada']['childOrgs'][departmentName]['childOrgs']) {
            let element = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department] 
            let departmentChildLength = Object.keys(element['childOrgs']).length; 
            secondary_depth_child_orgs = 0
            for (each_branch in element['childOrgs']) {
                secondary_depth_child_orgs = secondary_depth_child_orgs + Object.keys(element['childOrgs'][each_branch]['childOrgs']).length
            } 
            let deptShapeHeight = (baseHeight * departmentChildLength) + (secondary_depth_child_orgs * (baseHeight + baseBuffer)) + (baseBuffer * secondary_depth_child_orgs) + (baseBuffer * departmentChildLength);
            if (departmentChildLength == 0) {
                deptShapeHeight = 1500
            }
            let departmentShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: department + " (" + element.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        y: total_vertical_offset + baseBuffer + (deptShapeHeight / 2), 
                        x: total_horizontal_offset
                    },
                    geometry: {width: baseWidth, height: deptShapeHeight},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: departmentFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
    
            let subCount = 0;
            let branch_offset = 0
            for (branch_node in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs']) {
                const branch = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node];
                let branchChildLength = Object.keys(branch['childOrgs']).length;  
                let secondary_branch_length = 0;
                for (each_secondary_branch in branch['childOrgs']) {
                    if (secondary_branch_length < Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length) {
                        secondary_branch_length = Object.keys(branch['childOrgs'][each_secondary_branch]['childOrgs']).length;
                    }
                } 
                let shapeHeight = baseHeight + (branchChildLength * (baseHeight + baseBuffer)) + (baseBuffer * branchChildLength);
                let branchShape = await createShape({
                    data: {
                        shape: 'round_rectangle',
                        content: branch.name + " (" + branch.population + " people)"
                    },
                    position: {
                        origin: 'center', 
                        y: total_vertical_offset + branch_offset + baseBuffer + (shapeHeight / 2), 
                        // y: baseHeight + baseBuffer
                        x: total_horizontal_offset - (baseWidth + (baseBuffer * 4))
                    },
                    geometry: {width: baseWidth + baseBuffer, height: shapeHeight},
                    style: {
                        borderOpacity: '0.8',
                        color: '#1a1a1a',
                        fillColor: '#8fd14f',
                        fillOpacity: '0.4',
                        fontFamily: 'open_sans',
                        fontSize: secondaryFontSize,
                        textAlign: 'center',
                        textAlignVertical: 'middle'
                    },
                })
                subCount++
                let divisionCount = 1;
                let division_offset = 0;
                for (division_node in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs']) {
                    const division = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]
                    final_depth_child_orgs = Object.keys(govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // final_depth_child_orgs = 1
                    // for (each_team in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                    //     final_depth_child_orgs = final_depth_child_orgs + Object.keys(govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']).length
                    // } 
                    // console.log()
                    let division_shape_width = (stickyHeight * final_depth_child_orgs) + (baseBuffer * final_depth_child_orgs) + baseWidth / 2;;
                    let divisionTicket = await createShape({
                        data: {
                            shape: 'round_rectangle',
                            content: division.name + " (" + division.population + " people)"
                        },
                        position: {
                            origin: 'center', 
                            y: (baseHeight * divisionCount) + total_vertical_offset + division_offset + branch_offset + (baseBuffer * divisionCount), 
                            x: total_horizontal_offset - ((division_shape_width / 2) + (baseWidth * 2) - (baseBuffer * 1))
                        },
                        geometry: {width: division_shape_width, height: baseHeight},
                        style: {
                            borderOpacity: '0.8',
                            color: '#1a1a1a',
                            fillColor: '#8fd14f',
                            fillOpacity: '0.4',
                            fontFamily: 'open_sans',
                            fontSize: secondaryFontSize,
                            textAlign: 'center',
                            textAlignVertical: 'top'
                        },
                    })
    
                    teamCount = 1;
                    for (each_unit in govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs']) {
                        team_details = govData['Canada']['childOrgs'][departmentName]['childOrgs'][department]['childOrgs'][branch_node]['childOrgs'][division_node]['childOrgs'][each_unit]
                        
                        let teamLabel = makeSticky({
                            data: {
                                shape: 'square', 
                                content: team_details.name + " (" + team_details.population + " people)"
                            },
                            style: {
                                fillColor: 'light_yellow',
                                textAlign: 'left',
                                textAlignVertical: 'middle'
                            },
                            position: {
                                origin: 'center', 
                                y: (baseHeight * divisionCount) + total_vertical_offset + baseBuffer + division_offset + branch_offset + (baseBuffer * divisionCount), 
                                x: total_horizontal_offset - ((baseWidth * 2) + (stickyHeight * teamCount) + (stickyBuffer * teamCount))
                            },
                            geometry: {
                                height: stickyHeight
                            }
                        })
                        teamCount++
                    }
    
                    divisionCount++
    
                }
                division_offset = division_offset + baseHeight + baseBuffer
                branch_offset = branch_offset + shapeHeight + baseBuffer
    
                count++
            }
            total_vertical_offset = total_vertical_offset + deptShapeHeight + baseBuffer;
        }
        const department_title = await board.createTextItem({
                data: {
                    content: departmentName},
            style: {
                color: '#1a1a1a',
                fillColor: '#ffffff',
                fillOpacity: '0',
                fontFamily: 'open_sans',
                fontSize: '288',
                textAlign: 'center'
            },
            position: {
                origin: 'center', 
                x: horizontalOffset + baseWidth + baseBuffer, 
                y: baseWidth / 2
            },
            geometry: {
                rotation: 90, 
                width: baseWidth * 3
            }
        })
    }

    //Draw functions take the name of the department to draw, and the horizontal/vertical offset so you can
    //avoid them overlapping each other on the page.
    //FUTURE TODO: Auto-detect final draw size so we can lay them out automatically with just two department names

    //functionName(departmentName, horizontalOffset, verticalOffset)

    //drawHorizontal() produces a normal flat tree structure, hierarchy from top to bottom.
    // drawHorizontal('Employment and Social Development Canada', -5000,-500)
    
    //drawVertical draws a vertical left-aligned hierarchy with teams flowing out to the right.
    // drawVertical('Employment and Social Development Canada', -500, -5000)
    
    //DrawInvertedVertical is a right-aligned hierarchy with teams flowing out to the left, good for contrasting against drawVertical
    drawInvertedVertical('Statistics Canada', 3500, -5000)


})()

