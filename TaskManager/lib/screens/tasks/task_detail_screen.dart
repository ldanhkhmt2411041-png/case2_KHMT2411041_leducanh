import 'package:flutter/material.dart';
import '../../models/task.dart';
import '../../services/task_service.dart';
import 'task_edit_screen.dart';

class TaskDetailScreen extends StatefulWidget {
  final Task task;

  const TaskDetailScreen({super.key, required this.task});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  late Task _currentTask;

  @override
  void initState() {
    super.initState();
    _currentTask = widget.task;
  }

  void _handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xac nhan xoa'),
        content: const Text('Ban co chac chan muon xoa cong viec nay khong?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Huy')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Xoa', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirm == true) {
      final success = await TaskService.deleteTask(_currentTask.id);
      if (mounted && success) {
        Navigator.pop(context, true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi Tiet Cong Viec'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final updated = await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TaskEditScreen(task: _currentTask)),
              );
              if (updated == true && mounted) {
                Navigator.pop(context, true);
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete, color: Colors.red),
            onPressed: _handleDelete,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _currentTask.title,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const Divider(height: 24),
                const Text('Mo ta:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(_currentTask.description.isEmpty ? 'Khong co mo ta' : _currentTask.description),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Text('Muc do uu tien: ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Chip(label: Text(_currentTask.priority.toUpperCase())),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Text('Trang thai: ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Chip(label: Text(_currentTask.status.toUpperCase())),
                  ],
                ),
                if (_currentTask.dueDate != null) ...[
                  const SizedBox(height: 8),
                  Text('Han hoan thanh: ${_currentTask.dueDate.toString().split(' ')[0]}'),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
