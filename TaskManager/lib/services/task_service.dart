import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';
import '../models/task.dart';

class TaskService {
  static const String baseUrl = 'http://localhost:5000/api/tasks';

  static Future<List<Task>> getTasks({String? status, String? priority, String? q}) async {
    try {
      final token = await AuthService.getToken();
      final queryParams = <String, String>{};
      if (status != null && status.isNotEmpty) queryParams['status'] = status;
      if (priority != null && priority.isNotEmpty) queryParams['priority'] = priority;
      if (q != null && q.isNotEmpty) queryParams['q'] = q;

      final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams.isEmpty ? null : queryParams);

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        final List tasksJson = body['data'] ?? [];
        return tasksJson.map((t) => Task.fromJson(t)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  static Future<bool> createTask(String title, String description, String priority, DateTime? dueDate) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'title': title,
          'description': description,
          'priority': priority,
          'dueDate': dueDate?.toIso8601String(),
        }),
      );
      return response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> updateTask(String taskId, Map<String, dynamic> data) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.put(
        Uri.parse('$baseUrl/$taskId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> updateStatus(String taskId, String status) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.patch(
        Uri.parse('$baseUrl/$taskId/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> deleteTask(String taskId) async {
    try {
      final token = await AuthService.getToken();
      final response = await http.delete(
        Uri.parse('$baseUrl/$taskId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
