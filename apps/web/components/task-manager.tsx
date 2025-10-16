"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useToast,
} from "@jn7f1qecj9mg71yhrzbfnmmpsn7sh1ep/components";
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export function TaskManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");

  // Queries
  const tasks = useQuery(api.endpoints.tasks.list);
  const taskCounts = useQuery(api.endpoints.tasks.getCounts);

  // Mutations
  const createTask = useMutation(api.endpoints.tasks.create);
  const updateTask = useMutation(api.endpoints.tasks.update);
  const deleteTask = useMutation(api.endpoints.tasks.remove);

  const loading = tasks === undefined || taskCounts === undefined;

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
        priority: selectedPriority,
        status: "todo",
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setNewTaskTitle("");
      setNewTaskDescription("");
      setSelectedPriority("medium");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (taskId: Id<"tasks">, currentStatus: string) => {
    const nextStatus =
      currentStatus === "todo"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "completed"
        : "todo";

    try {
      await updateTask({
        id: taskId,
        status: nextStatus as "todo" | "in_progress" | "completed",
      });

      toast({
        title: "Task updated",
        description: `Task marked as ${nextStatus.replace("_", " ")}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ id: taskId });

      toast({
        title: "Task deleted",
        description: "Task removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Tasks</CardTitle>
          {!loading && taskCounts && (
            <div className="mt-2 flex gap-4 text-sm text-neutral-foreground-secondary">
              <span>{taskCounts.todo} To Do</span>
              <span>{taskCounts.in_progress} In Progress</span>
              <span>{taskCounts.completed} Completed</span>
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Input
                  placeholder="Enter task description..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <div className="mt-2 flex gap-2">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <Button
                      key={priority}
                      variant={selectedPriority === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPriority(priority)}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-12 w-full" />
                </TableCell>
              </TableRow>
            ) : tasks && tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-neutral-foreground-secondary"
                >
                  No tasks yet. Click "New Task" to create your first task!
                </TableCell>
              </TableRow>
            ) : (
              tasks?.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    <button
                      onClick={() => handleToggleStatus(task._id, task.status)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-neutral-foreground-secondary">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-foreground-secondary">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
