import 'package:flutter/material.dart';
import '../../models/task.dart';
import '../../services/auth_service.dart';
import '../../services/task_service.dart';
import '../auth/login_screen.dart';
import 'task_create_screen.dart';
import 'task_detail_screen.dart';

class TaskListScreen extends StatefulWidget {
  const TaskListScreen({super.key});

  @override
  State<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends State<TaskListScreen> {
  List<Task> _tasks = [];
  bool _isLoading = true;
  String _selectedStatus = '';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final tasks = await TaskService.getTasks(
      status: _selectedStatus.isEmpty ? null : _selectedStatus,
      q: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
    );
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tim kiem cong viec...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    _loadTasks();
                  },
                ),
                border: const OutlineInputBorder(),
              ),
              onSubmitted: (_) => _loadTasks(),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Tat ca'),
                  selected: _selectedStatus == '',
                  onSelected: (val) {
                    setState(() => _selectedStatus = '');
                    _loadTasks();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Chua lam'),
                  selected: _selectedStatus == 'todo',
                  onSelected: (val) {
                    setState(() => _selectedStatus = 'todo');
                    _loadTasks();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Dang lam'),
                  selected: _selectedStatus == 'in_progress',
                  onSelected: (val) {
                    setState(() => _selectedStatus = 'in_progress');
                    _loadTasks();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Hoan thanh'),
                  selected: _selectedStatus == 'completed',
                  onSelected: (val) {
                    setState(() => _selectedStatus = 'completed');
                    _loadTasks();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _tasks.isEmpty
                    ? const Center(child: Text('Khong tim thay cong viec nao.'))
                    : RefreshIndicator(
                        onRefresh: _loadTasks,
                        child: ListView.builder(
                          itemCount: _tasks.length,
                          itemBuilder: (context, index) {
                            final task = _tasks[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                              child: ListTile(
                                onTap: () async {
                                  final changed = await Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => TaskDetailScreen(task: task)),
                                  );
                                  if (changed == true) _loadTasks();
                                },
                                title: Text(
                                  task.title,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w600,
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
                                trailing: const Icon(Icons.chevron_right),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
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
