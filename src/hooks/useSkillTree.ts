import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface SkillNode {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "skill" | "milestone";
  category: "eps" | "topik" | "general";
  level: number; // 1-60 for lessons, 1-10 for skills
  prerequisites: string[]; // IDs of required nodes
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
  position: { x: number; y: number }; // For visualization
}

interface SkillTreeData {
  nodes: SkillNode[];
  edges: { from: string; to: string }[];
  lastUpdated: number;
}

const initialSkillTree: SkillTreeData = {
  nodes: [
    // EPS Lessons (1-60)
    ...Array.from({ length: 60 }, (_, i) => ({
      id: `eps-lesson-${i + 1}`,
      title: `Bài ${i + 1}`,
      description: i === 0 ? "Bài nhập môn" : `Bài học số ${i + 1}`,
      type: "lesson" as const,
      category: "eps" as const,
      level: i + 1,
      prerequisites: i === 0 ? [] : [`eps-lesson-${i}`],
      xpReward: 100,
      completed: false,
      unlocked: i === 0,
      position: { x: (i % 10) * 100, y: Math.floor(i / 10) * 100 },
    })),
    // Milestones
    {
      id: "milestone-10",
      title: "Hoàn thành 10 bài",
      description: "Đã học xong 10 bài đầu tiên",
      type: "milestone",
      category: "eps",
      level: 10,
      prerequisites: ["eps-lesson-10"],
      xpReward: 500,
      completed: false,
      unlocked: false,
      position: { x: 500, y: 200 },
    },
    {
      id: "milestone-30",
      title: "Hoàn thành 30 bài",
      description: "Đã học xong 30 bài",
      type: "milestone",
      category: "eps",
      level: 30,
      prerequisites: ["eps-lesson-30"],
      xpReward: 1000,
      completed: false,
      unlocked: false,
      position: { x: 500, y: 400 },
    },
    {
      id: "milestone-60",
      title: "Hoàn thành toàn bộ",
      description: "Đã học xong 60 bài EPS",
      type: "milestone",
      category: "eps",
      level: 60,
      prerequisites: ["eps-lesson-60"],
      xpReward: 2000,
      completed: false,
      unlocked: false,
      position: { x: 500, y: 600 },
    },
  ],
  edges: [
    // Lesson prerequisites
    ...Array.from({ length: 59 }, (_, i) => ({
      from: `eps-lesson-${i + 1}`,
      to: `eps-lesson-${i + 2}`,
    })),
    // Milestone edges
    { from: "eps-lesson-10", to: "milestone-10" },
    { from: "eps-lesson-30", to: "milestone-30" },
    { from: "eps-lesson-60", to: "milestone-60" },
  ],
  lastUpdated: Date.now(),
};

export function useSkillTree() {
  const [skillTree, setSkillTree] = useLocalStorage<SkillTreeData>("kts_skill_tree", initialSkillTree);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const completeNode = (nodeId: string) => {
    setSkillTree(prev => {
      const updatedNodes = prev.nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, completed: true };
        }
        return node;
      });

      // Unlock dependent nodes
      const unlockedNodes = updatedNodes.map(node => {
        if (!node.unlocked && node.prerequisites.length > 0) {
          const allPrereqsCompleted = node.prerequisites.every(prereqId =>
            updatedNodes.find(n => n.id === prereqId)?.completed
          );
          if (allPrereqsCompleted) {
            return { ...node, unlocked: true };
          }
        }
        return node;
      });

      return {
        ...prev,
        nodes: unlockedNodes,
        lastUpdated: Date.now(),
      };
    });
  };

  const getNode = (nodeId: string) => {
    return skillTree.nodes.find(n => n.id === nodeId);
  };

  const getDependentNodes = (nodeId: string) => {
    return skillTree.nodes.filter(n => n.prerequisites.includes(nodeId));
  };

  const getProgress = () => {
    const completed = skillTree.nodes.filter(n => n.completed).length;
    const total = skillTree.nodes.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const getCategoryNodes = (category: string) => {
    return skillTree.nodes.filter(n => n.category === category);
  };

  const resetTree = () => {
    setSkillTree(initialSkillTree);
  };

  return {
    skillTree,
    selectedNode,
    setSelectedNode,
    completeNode,
    getNode,
    getDependentNodes,
    getProgress,
    getCategoryNodes,
    resetTree,
  };
}
