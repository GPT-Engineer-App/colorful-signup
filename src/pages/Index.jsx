import { useState } from "react";
import { Box, Heading, Input, Button, Text, Checkbox, VStack, HStack, useToast } from "@chakra-ui/react";
import { FaPlus, FaSignInAlt, FaUserPlus } from "react-icons/fa";

const API_URL = "https://backengine-tqwu.fly.dev";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const toast = useToast();

  const handleAuth = async () => {
    const endpoint = isLogin ? "/login" : "/signup";
    const response = await fetch(API_URL + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      if (isLogin) {
        const { accessToken } = await response.json();
        setAccessToken(accessToken);
        fetchTasks(accessToken);
      } else {
        setIsLogin(true);
        toast({
          title: "Account created",
          description: "Your account has been created successfully. Please log in.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      const { error } = await response.json();
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchTasks = async (token) => {
    const response = await fetch(API_URL + "/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setTasks(data);
  };

  const addTask = async () => {
    const response = await fetch(API_URL + "/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title: newTask, is_done: false }),
    });
    if (response.ok) {
      setNewTask("");
      fetchTasks(accessToken);
    }
  };

  const toggleTask = async (id, is_done) => {
    await fetch(API_URL + `/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ is_done: !is_done }),
    });
    fetchTasks(accessToken);
  };

  if (!accessToken || tasks === null) {
    return (
      <Box p={8}>
        <Heading mb={8}>{isLogin ? "Login" : "Sign Up"}</Heading>
        <Input placeholder="Email" mb={4} value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" mb={4} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button leftIcon={isLogin ? <FaSignInAlt /> : <FaUserPlus />} onClick={handleAuth}>
          {isLogin ? "Login" : "Sign Up"}
        </Button>
        <Text mt={4} onClick={() => setIsLogin(!isLogin)} cursor="pointer">
          {isLogin ? "Create an account" : "Already have an account? Login"}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={8}>Todo List</Heading>
      <HStack mb={8}>
        <Input placeholder="New task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <Button leftIcon={<FaPlus />} onClick={addTask}>
          Add
        </Button>
      </HStack>
      <VStack align="stretch" spacing={4}>
        {tasks.map((task) => (
          <HStack key={task.id}>
            <Checkbox isChecked={task.is_done} onChange={() => toggleTask(task.id, task.is_done)} />
            <Text>{task.title}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default Index;
