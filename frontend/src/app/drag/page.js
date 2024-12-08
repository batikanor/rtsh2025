    "use client";

    import React, { useState } from "react";
    import {
      Box,
      Typography,
      Card,
      CardContent,
      Grid,
      Chip,
      Divider,
      Paper,
      Modal,
      Snackbar,
      Alert,
      FormControl,
      InputLabel,
      Select,
      MenuItem,
    } from "@mui/material";
    import { styled } from "@mui/system";
    import {
      DndContext,
      useDraggable,
      useDroppable,
      DragOverlay,
    } from "@dnd-kit/core";

    const companies = {
      BMW: ["TO DO", "IN PROGRESS", "DONE"],
      BOSCH: [
        "OPEN",
        "IN PROGRESS",
        "UNDER REVIEW",
        "APPROVED",
        "DONE",
        "CANCELLED",
        "REJECTED",
      ],
      Porsche: ["TO DO", "IN PROGRESS", "DONE"],
    };

    const companyAWorkflow = ["TO DO", "IN PROGRESS", "DONE"];
    const companyBWorkflow = [
      "OPEN",
      "IN PROGRESS",
      "UNDER REVIEW",
      "APPROVED",
      "DONE",
      "CANCELLED",
      "REJECTED",
    ];

    const sampleTickets = {
      "TO DO": [
        {
          id: 1,
          title: "Assemble engine components",
          description:
            "This task involves assembling the core engine components required for BMW Series 5 models. " +
            "The process includes verifying all supplier-provided parts, integrating precision-engineered pistons, " +
            "and ensuring that the crankshaft aligns with the design specifications. This stage is critical as it " +
            "lays the foundation for the car's performance and reliability. Any delays or issues here can cause significant downstream bottlenecks.",
          comments: [
            "Critical step before the assembly line starts.",
            "Ensuring all components meet initial specifications.",
            "Reviewing supplier-provided parts for compliance.",
            "Scheduling line workers for assembly setup.",
          ],
        },
        {
          id: 2,
          title: "Prepare chassis materials",
          description:
            "This step focuses on organizing, inspecting, and preparing the chassis materials needed for vehicle assembly. " +
            "Key activities include ensuring that the steel and aluminum meet structural integrity requirements, cutting materials " +
            "to precise measurements, and applying anti-corrosion treatments. It also involves coordinating with the logistics team " +
            "to align with production schedules. This preparation ensures that the subsequent assembly stages proceed without interruptions.",
          comments: [
            "Chassis preparation often delays the process; needs careful planning.",
            "Material quality is verified during this stage.",
            "Inventory tracking is crucial to avoid shortages.",
            "Coordination with BOSCH ensures compatibility.",
          ],
        },
      ],
      "IN PROGRESS": [
        {
          id: 3,
          title: "Paint car body",
          description:
            "Painting the car body is a meticulous task involving multiple layers of primer, base coat, and clear coat. " +
            "Each layer is applied in climate-controlled booths to ensure precision and consistency. This step not only " +
            "affects the vehicle's aesthetic appeal but also adds a protective layer against environmental damage. Custom paint options " +
            "for premium customers require close coordination with the design and quality teams to meet exact color specifications. " +
            "Matching colors with BOSCH’s additional parts, like bumpers or mirrors, is crucial for a cohesive look.",
          comments: [
            "Premium customers expect flawless finishes.",
            "Matching colors with BOSCH requirements is crucial.",
            "Process must adhere to eco-friendly standards.",
            "Timing is key to avoid production bottlenecks.",
          ],
        },
        {
          id: 4,
          title: "Install interior fittings",
          description:
            "This stage involves assembling and installing all interior components, including luxury leather seats, infotainment systems, " +
            "and trim panels. Precision is critical as any misalignment can compromise the customer experience. Quality checks are conducted " +
            "on the stitching of seats, electronic connections for multimedia systems, and acoustic insulation. For customized orders, " +
            "special configurations and materials are handled with extra care to ensure compliance with client requests.",
          comments: [
            "Focus on precision; leather quality checks are done concurrently.",
            "The mapping helps ensure proper sequence with BOSCH inspection.",
            "Seating configurations vary per customer order.",
            "Electronic components for seats are integrated here.",
          ],
        },
      ],
      DONE: [
        {
          id: 5,
          title: "Deliver completed cars",
          description:
            "The delivery process involves organizing the finished vehicles into shipment groups based on their destination. " +
            "Every vehicle undergoes a final quality inspection to ensure it meets both BMW and BOSCH standards. Shipping " +
            "documents, including warranties and compliance certificates, are prepared and reviewed. Coordination with BOSCH logistics " +
            "teams ensures that the delivery schedule aligns with dealership demands and customer expectations.",
          comments: [
            "This is the final step before handoff to BOSCH.",
            "Delivery timing is coordinated with BOSCH logistics.",
            "Vehicles are grouped by destination region.",
            "Shipping documents are double-checked here.",
          ],
        },
        {
          id: 6,
          title: "Finalize production report",
          description:
            "At this stage, detailed production reports are generated, summarizing the entire manufacturing process. " +
            "Metrics such as production time, resource usage, defect rates, and efficiency levels are documented. These reports " +
            "are shared with BOSCH for analysis and improvement planning. The QA team also reviews customer feedback and integrates " +
            "it into future production cycles to enhance overall quality and efficiency.",
          comments: [
            "QA team reviews the production efficiency metrics here.",
            "Critical insights shared with BOSCH partners.",
            "Feedback loops are analyzed for process improvements.",
            "Inventory reconciliation is finalized at this stage.",
          ],
        },
      ],
    };

    const WorkflowBox = styled("div")({
      padding: "1rem",
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #e5e7eb",
      borderRadius: "0.375rem",
      cursor: "grab",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "scale(1.03)",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
      },
    });

    const CommentBox = styled(Paper)({
      padding: "0.75rem",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      borderRadius: "0.375rem",
      margin: "0.5rem 0.5rem 0.5rem 0",
      width: "calc(50% - 0.5rem)",
      boxShadow: "none",
      fontSize: "0.9rem",
    });

    const MappingLine = styled("div")({
      padding: "0.75rem",
      border: "1px dashed #e5e7eb",
      borderRadius: "0.375rem",
      marginBottom: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.5rem",
    });

    const MappingLabel = styled("span")({
      fontWeight: "600",
    });

    export default function Page() {
      const [mapping, setMapping] = useState({});
      const [activeDragItem, setActiveDragItem] = useState(null);
      const [llmCommands, setLlmCommands] = useState({});
      const [isSimulating, setIsSimulating] = useState(false);
      const [simulationResults, setSimulationResults] = useState([]);
      const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
      });
      const [companyA, setCompanyA] = useState("BMW"); // Default selection
      const [companyB, setCompanyB] = useState("BOSCH"); // Default selection

      const handleDragStart = (event) => {
        setActiveDragItem(event.active.id);
      };

      const handleDragEnd = (event) => {
        const { over } = event;
        if (over && activeDragItem) {
          if (
            companyAWorkflow.includes(activeDragItem) &&
            companyBWorkflow.includes(over.id)
          ) {
            setMapping((prev) => {
              const current = prev[activeDragItem] || [];
              if (!current.includes(over.id)) {
                return {
                  ...prev,
                  [activeDragItem]: [...current, over.id],
                };
              }
              return prev;
            });
          }
        }
        setActiveDragItem(null);
      };

      const handleRemoveMapping = (aState, bState) => {
        setMapping((prev) => {
          const updatedBStates = (prev[aState] || []).filter((s) => s !== bState);
          if (updatedBStates.length === 0) {
            const { [aState]: _, ...rest } = prev;
            return rest;
          } else {
            return {
              ...prev,
              [aState]: updatedBStates,
            };
          }
        });

        setLlmCommands((prev) => {
          const updatedBStates = (prev[aState] || []).filter((s) => s !== bState);
          if (updatedBStates.length === 0) {
            const { [aState]: _, ...rest } = prev;
            return rest;
          } else {
            return {
              ...prev,
              [aState]: updatedBStates,
            };
          }
        });
      };

      const handleLlmCommandChange = (aState, command) => {
        setLlmCommands((prev) => ({
          ...prev,
          [aState]: command,
        }));
      };

      function askLLM(mappedStates) {
        // Hard-coded to always choose the second option
        if (mappedStates.length >= 2) {
          return mappedStates[1];
        }
        return mappedStates[0];
      }

      const handleSimulateSync = () => {
        setIsSimulating(true);
        const results = [];
      
        for (const aState of Object.keys(mapping)) {
          if (mapping[aState].length >= 2) {
            const tickets = sampleTickets[aState] || [];
            for (const ticket of tickets) {
              const chosenState = askLLM(mapping[aState]);
              // Show the ticket using its title and first part of its description
              const shortDescription = ticket.description.length > 100 
                ? ticket.description.substring(0, 100) + "..." 
                : ticket.description;
              results.push(
                `The ticket titled "${ticket.title}" currently in A state "${aState}" will be mapped to "${chosenState}".\nDescription: ${shortDescription}`
              );
            }
          }
        }
      
        setSimulationResults(results);
      };
      

      const handleSimulateAllSync = () => {
        setIsSimulating(true);
        const results = [];
        // For now, just simulate with no logic, or we could apply similar logic as handleSimulateSync
        // If needed, expand here
        results.push("All mappings simulated!");
        setSimulationResults(results);
      };

      const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setSnackbar((prev) => ({ ...prev, open: false }));
      };

      const handleAcknowledge = () => {
        setIsSimulating(false);
        setSimulationResults([]);
      };

      const mappedStates = Object.keys(mapping);
      const hasMultipleMappings = mappedStates.some(
        (stateA) => mapping[stateA].length >= 2
      );

      const renderSampleTickets = (statusA) => {
        const mappedBStates = mapping[statusA] || [];
        if (mappedBStates.length < 2) {
          return null; // Do not render tickets if less than 2 mappings
        }
        const tickets = sampleTickets[statusA] || [];
        return (
          <div key={statusA}>
            <Typography variant="h6" className="font-bold mb-4">
              Sample Tickets for "{statusA}" Stage
            </Typography>
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                variant="outlined"
                className="mb-4 p-4 rounded-md border border-gray-300"
              >
                <CardContent>
                  <Typography variant="subtitle1" className="font-bold">
                    {ticket.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    {ticket.description}
                  </Typography>
                  <Typography variant="body2">
                    Mapped to Company B Status(es):{" "}
                    <strong>{mappedBStates.join(", ")}</strong>
                  </Typography>
                  <Divider className="my-2" />
                  <Typography variant="body2" className="font-bold mb-5">
                    BMW Employee Comments:
                  </Typography>
                  <Grid container spacing={2}>
                    {ticket.comments.map((comment, index) => (
                      <CommentBox key={index}>{comment}</CommentBox>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      };

      return (
        <div className="text-center mb-16 px-4 py-8">
          <Typography
            variant="h3"
            component="h1"
            className="mb-4 font-bold text-2xl"
          >
            BMW to BOSCH Workflow Mapping Tool
          </Typography>
          <Typography variant="body1" className="mb-8">
            Drag a status from BMW (left) and drop it onto one or more statuses in
            BOSCH (right). Click on a mapped BOSCH state to remove that mapping.
          </Typography>

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Grid container spacing={6}>
              {/* BMW Workflow */}
              <Grid item xs={12} md={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  className="text-2xl font-bold  mb-4"
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 150, marginRight: 2 }}
                  >
                    <InputLabel
                      id="company-select-label"
                      className="mb-2 text-black dark:text-white"
                    >
                      Company
                    </InputLabel>
                    <Select
                      className="text-black dark:text-white mb-2 text-2xl"
                      labelId="company-select-label"
                      id="company-select"
                      value={companyA}
                      onChange={(e) => setCompanyA(e.target.value)}
                      label="Company"
                    >
                      {Object.keys(companies).map((company) => (
                        <MenuItem key={company} value={company}>
                          {company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="h6">Workflow</Typography>
                </Box>
                {companyAWorkflow.map((state) => (
                  <DraggableItem key={state} id={state}>
                    {state}
                  </DraggableItem>
                ))}
              </Grid>

              {/* Mappings */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="text-lg font-bold mb-4">
                  Mappings
                </Typography>
                {mappedStates.length === 0 ? (
                  <Typography variant="body1">
                    No mappings yet. Drag & drop to create one.
                  </Typography>
                ) : (
                  <>
                    {mappedStates.map((stateA) => (
                      <MappingLine key={stateA}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <MappingLabel>{stateA}</MappingLabel>
                          <Typography variant="body1">→</Typography>
                          {mapping[stateA].map((bState) => (
                            <Chip
                              key={bState}
                              label={bState}
                              onClick={() => handleRemoveMapping(stateA, bState)}
                              variant="outlined"
                              color="primary"
                              size="large"
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </Box>

                        {mapping[stateA].length >= 2 && (
                          <Box gap={2} mt={2} width="100%">
                            <Box flexGrow={1}>
                              <Typography variant="body1" className="font-bold mb-2">
                                LLM Command:
                              </Typography>
                              <textarea
                                className="text-gray-600 mb-2"
                                rows="5"
                                placeholder="Enter your command here. Example: 'If the ticket description or last comment implies engineers are done and are awaiting review, put it to respective status. If it appears to be peer-reviewed by another engineer already and approved, yet not brought to status due to the manager not taking action yet, put it to 'approved' instead.'"
                                value={llmCommands[stateA] || ""}
                                onChange={(e) =>
                                  handleLlmCommandChange(stateA, e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "0.375rem",
                                  fontSize: "1rem",
                                  resize: "vertical",
                                }}
                              ></textarea>
                            </Box>
                            <Box>
                              <button
                                onClick={handleSimulateSync}
                                style={{
                                  padding: "0.75rem 1.5rem",
                                  border: "1px dashed #e5e7eb",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  height: "fit-content",
                                }}
                              >
                                Simulate Sync
                              </button>
                            </Box>
                          </Box>
                        )}
                      </MappingLine>
                    ))}

                    {hasMultipleMappings && (
                      <Box display="flex" justifyContent="center" mt={4}>
                        <button
                          onClick={handleSimulateAllSync}
                          style={{
                            padding: "0.75rem 1.5rem",
                            border: "1px dashed #e5e7eb",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Simulate All Sync
                        </button>
                      </Box>
                    )}
                  </>
                )}
              </Grid>

              {/* BOSCH Workflow */}
              <Grid item xs={12} md={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  className="text-2xl font-bold  mb-4"
                >
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 150, marginRight: 2 }}
                  >
                    <InputLabel
                      id="company-select-label"
                      className="mb-2 text-black dark:text-white"
                    >
                      Company
                    </InputLabel>
                    <Select
                      className="text-black dark:text-white mb-2 text-2xl"
                      labelId="company-select-label"
                      id="company-select"
                      value={companyB}
                      onChange={(e) => setCompanyB(e.target.value)}
                      label="Company"
                    >
                      {Object.keys(companies).map((company) => (
                        <MenuItem key={company} value={company}>
                          {company}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="h6">Workflow</Typography>
                </Box>
                {companyBWorkflow.map((state) => (
                  <DroppableItem key={state} id={state}>
                    {state}
                  </DroppableItem>
                ))}
              </Grid>
            </Grid>

            <DragOverlay>
              {activeDragItem ? (
                <WorkflowBox className="bg-blue-500 text-white">
                  {activeDragItem}
                </WorkflowBox>
              ) : null}
            </DragOverlay>
          </DndContext>

          <Modal
            open={isSimulating}
            onClose={() => {}} // Do nothing on outside click
            aria-labelledby="simulating-sync"
            aria-describedby="simulating-the-sync-process"
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100vh"
            >
              <Box
                bgcolor="background.paper"
                p={4}
                borderRadius="0.375rem"
                boxShadow={24}
                textAlign="center"
                maxWidth="600px"
                width="100%"
              >
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  className="text-gray-600 mb-2"
                >
                  Simulating Syncronization
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  The LLM has chosen the following mappings:
                </Typography>
                <Box
                  bgcolor="#f3f4f6"
                  p={2}
                  borderRadius="0.375rem"
                  mb={4}
                  maxHeight="200px"
                  overflow="auto"
                >
                  {simulationResults.length === 0 ? (
                    <Typography variant="body2" className="text-gray-600">
                      No results yet.
                    </Typography>
                  ) : (
                    simulationResults.map((res, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        className="text-gray-800 mb-1"
                      >
                        {res}
                      </Typography>
                    ))
                  )}
                </Box>
                <button className="text-gray-600"
                  onClick={handleAcknowledge}
                  style={{
                    
                    padding: "0.75rem 1.5rem",
                    border: "1px dashed #e5e7eb",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Acknowledge
                </button>
              </Box>
            </Box>
          </Modal>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          <div className="mt-16">
            <Divider className="mb-4" />
            {companyAWorkflow.map((status) => renderSampleTickets(status))}
          </div>
        </div>
      );
    }

    function DraggableItem({ id, children }) {
      const { attributes, listeners, setNodeRef, transform, transition } =
        useDraggable({ id });
      const style = {
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        marginBottom: "1rem",
        zIndex: 1000,
      };

      return (
        <WorkflowBox ref={setNodeRef} style={style} {...attributes} {...listeners}>
          {children}
        </WorkflowBox>
      );
    }

    function DroppableItem({ id, children }) {
      const { isOver, setNodeRef } = useDroppable({ id });
      const style = {
        backgroundColor: isOver ? "rgba(59, 130, 246, 0.1)" : undefined,
        marginBottom: "1rem",
        border: isOver ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      };

      return (
        <WorkflowBox ref={setNodeRef} style={style}>
          {children}
        </WorkflowBox>
      );
    }
