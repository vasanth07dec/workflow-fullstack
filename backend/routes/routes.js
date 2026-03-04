import { Router } from "express";
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  getWorkflows,
  updateWorkflow,
} from "../controllers/workflow.js";
import {
  getStepsByWorkflowId,
  addStepToWorkflow,
  updateStep,
  deleteStep,
} from "../controllers/steps.js";
import {
  addRuleToStep,
  deleteRule,
  getRulesByStepId,
  updateRule,
} from "../controllers/rule.js";
import {
  addExecutionsToWorkflow,
  approveExecution,
  cancelExecution,
  getExecutedWorkflows,
  getExecutionById,
  retryExecution,
} from "../controllers/execution.js";
import { getApproversList } from "../controllers/approvers.js";
import { getMeController, loginController, logoutController } from "../controllers/auth.js";
import { protectMiddleware } from "../middlewares/auth.js";

const router = Router();

/**
 * workflow routes
 * - GET /workflows: List all workflows
 * - GET /workflows/:id: Get a specific workflow by ID
 * - POST /workflows: Create a new workflow
 * - PUT /workflows/:id: Update an existing workflow by ID
 * - DELETE /workflows/:id: Delete a workflow by ID
 */
router.get("/workflows", getWorkflows);
router.get("/workflows/:id", getWorkflowById);
router.post("/workflows", createWorkflow);
router.put("/workflows/:id", updateWorkflow);
router.delete("/workflows/:id", deleteWorkflow);

/**
 * step routes
 * - GET /workflows/:workflowId/steps: List all steps for a specific workflow
 * - POST /workflows/:workflowId/steps: Add a new step to a specific workflow
 * - PUT /steps/:stepId: Update an existing step by ID
 * - DELETE /steps/:stepId: Delete a step by ID
 */
router.get("/workflows/:workflowId/steps", getStepsByWorkflowId);
router.post("/workflows/:workflowId/steps", addStepToWorkflow);
router.put("/steps/:stepId", updateStep);
router.delete("/steps/:stepId", deleteStep);

/**
 * rule routes
 * - GET /steps/:stepId/rules: List all rules for a specific step
 * - POST /steps/:stepId/rules: Add a new rule to a specific step
 * - PUT /rules/:ruleId: Update an existing rule by ID
 * - DELETE /rules/:ruleId: Delete a rule by ID
 */
router.get("/steps/:step_id/rules", getRulesByStepId);
router.post("/steps/:step_id/rules", addRuleToStep);
router.put("/rules/:ruleId", updateRule);
router.delete("/rules/:ruleId", deleteRule);

/**
 * execution routes
 * - POST /workflows/:workflowId/execute: Execute a specific workflow
 * - GET /executions/:id: Get a specific execution by ID
 * - POST /executions/:id/cancel: Cancel a specific execution by ID
 * - POST /executions/:id/retry: Retry a specific execution by ID
 */
router.post("/workflows/:workflow_id/execute", addExecutionsToWorkflow);
router.get("/executions/:id", getExecutionById);
router.post("/executions/:id/cancel", cancelExecution);
router.post("/executions/:id/retry", retryExecution);

/**
 * Extras routes
 */
/**
 * Newly created route for show all executions of a workflow which wait for approval from approver
 */
router.get("/execution-workflow", getExecutedWorkflows)
router.post("/executions/:id/approve", approveExecution);

/**
 * get approvers list based on role
 */
router.get("/approvers-list", getApproversList)

/**
 * auth routes
 */
router.post("/login", loginController)
router.post("/logout", logoutController)
router.get("/me", protectMiddleware, getMeController)

export default router;
