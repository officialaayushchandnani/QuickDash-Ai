import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// --- Configuration ---
// I've lowered this from a very high number. 1000ms (1 second) is a more
// standard delay to allow for exit animations before removing the toast from the DOM.
const TOAST_REMOVE_DELAY = 1000;

// This defines how many toasts can be visible at once.
const TOAST_LIMIT = 1;

// --- Type Definitions ---
// This combines the base props with the properties our toaster system needs.
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// ============================================================================
// SECTION: Core State Management (The "Mini-Redux")
// This part of the code lives outside of React. It allows us to call `toast()`
// from anywhere in our application.
// ============================================================================

// A simple counter for generating unique toast IDs.
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Defining the shape of our state and the actions that can change it.
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: ToasterToast["id"] }
  | { type: "REMOVE_TOAST"; toastId?: ToasterToast["id"] };

interface State {
  toasts: ToasterToast[];
}

// `memoryState` is our single source of truth, living outside any component.
let memoryState: State = { toasts: [] };

// `listeners` is an array of functions that will be called to notify
// components when the state changes.
const listeners: Array<(state: State) => void> = [];

// The reducer is a PURE function that calculates the next state.
// It no longer contains any side effects like `setTimeout`.
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            // This is the only change: the side effect is removed.
            : t
        ),
      };

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// The dispatch function is the only way to update the state.
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  // After updating the state, it notifies all subscribed components.
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

// ============================================================================
// SECTION: Public API (Functions to be used in our app)
// ============================================================================

type Toast = Omit<ToasterToast, "id">;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function toast(props: Toast) {
  const id = genId();

  // The `update` and `dismiss` functions are returned so the caller
  // can programmatically control the toast later.
  const update = (props: ToasterToast) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, dismiss, update };
}

// ============================================================================
// SECTION: React Hook (The bridge between our state and React components)
// ============================================================================

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  // This effect subscribes the component to our external state.
  React.useEffect(() => {
    // When the component mounts, add its `setState` function to the listeners.
    listeners.push(setState);

    // When the component unmounts, remove its `setState` to prevent memory leaks.
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]); // The dependency array ensures this runs correctly.

  // REFACTOR: We've moved the side effect here, out of the reducer.
  // This new dismiss function will handle both updating the state AND
  // managing the removal timeout.
  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });

    const addToRemoveQueue = (id: string) => {
      if (toastTimeouts.has(id)) return;
      const timeout = setTimeout(() => {
        toastTimeouts.delete(id);
        dispatch({ type: "REMOVE_TOAST", toastId: id });
      }, TOAST_REMOVE_DELAY);
      toastTimeouts.set(id, timeout);
    };

    if (toastId) {
      addToRemoveQueue(toastId);
    } else {
      // If no ID is provided, dismiss all toasts.
      state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
    }
  }, [state.toasts]);

  return {
    ...state,
    toast,
    dismiss,
  };
}

export { useToast, toast };