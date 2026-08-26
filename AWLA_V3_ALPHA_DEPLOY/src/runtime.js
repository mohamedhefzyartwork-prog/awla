
import { AwlaNativeAdapter } from "./adapters/awla-native.js";
import { ProductLockAdapter } from "./adapters/product-lock.js";
import { LayoutAdapter, QcAdapter } from "./adapters/internal.js";
import { ExecutionEngine } from "./core/execution.js";

export function createRuntime({workerUrl}={}){
  const adapters={
    "awla-native":new AwlaNativeAdapter({baseUrl:workerUrl}),
    "product-lock":new ProductLockAdapter(),
    "layout":new LayoutAdapter(),
    "qc":new QcAdapter()
  };
  return {adapters,engine:new ExecutionEngine({adapters,maxAttempts:2})};
}
