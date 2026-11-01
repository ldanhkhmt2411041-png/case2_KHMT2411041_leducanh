import 'package:flutter/material.dart';
import '../../models/task.dart';
import '../../services/auth_service.dart';
import '../../services/task_service.dart';
import '../auth/login_screen.dart';
import 'task_create_screen.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  List<Task> _tasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final tasks = await TaskService.getTasks();
    setState(() {
      _tasks = tasks;
      _isLoading = false;
    });
  }

  void _toggleStatus(Task task) async {
    String nextStatus = 'todo';
    if (task.status == 'todo') {
      nextStatus = 'in_progress';
    } else if (task.status == 'in_progress') {
      nextStatus = 'completed';
    }

    final success = await TaskService.updateStatus(task.id, nextStatus);
    if (success) _loadTasks();
  }

  void _deleteTask(String id) async {
    final success = await TaskService.deleteTask(id);
    if (success) _loadTasks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh Sach Cong Viec'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService.logout();
              if (context.mounted) {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginScreen()),
                );
              }
            },
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tasks.isEmpty
              ? const Center(child: Text('Chua co cong viec nao. Bam nut + de them.'))
              : RefreshIndicator(
                  onRefresh: _loadTasks,
                  child: ListView.builder(
                    itemCount: _tasks.length,
                    itemBuilder: (context, index) {
                      final task = _tasks[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: ListTile(
                          title: Text(
                            task.title,
                            style: TextStyle(
                              decoration: task.status == 'completed'
                                  ? TextDecoration.lineThrough
                                  : null,
                            ),
                          ),
                          subtitle: Text('Trang thai: ${task.status} | Uu tien: ${task.priority}'),
                          leading: IconButton(
                            icon: Icon(
                              task.status == 'completed'
                                  ? Icons.check_circle
                                  : Icons.radio_button_unchecked,
                              color: task.status == 'completed' ? Colors.green : Colors.grey,
                            ),
                            onPressed: () => _toggleStatus(task),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => _deleteTask(task.id),
                          ),
                        ),
                      );
                    },
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final created = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const TaskCreateScreen()),
          );
          if (created == true) _loadTasks();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
