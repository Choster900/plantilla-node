import { BaseSeeder } from '../BaseSeeder';
import { User } from '../../models/User';
import { List } from '../../models/List';
import Task from '../../models/Task';
import Subtask from '../../models/Subtask';

export class ListsTasksSeeder extends BaseSeeder {
    name = 'lists_tasks_subtasks';
    description = 'Seeds sample lists with tasks and subtasks';

    async run(): Promise<void> {
        console.log('🌱 Seeding lists, tasks and subtasks...');

        // Obtener todos los usuarios para asignar listas
        const users = await User.findAll();
        if (users.length === 0) {
            console.log('❌ No users found. Please run users seeder first.');
            return;
        }

        // Datos de ejemplo para las listas con sus tareas y subtareas
        const listsData = [
            {
                name: "Proyecto Personal",
                description: "Lista de tareas para mi proyecto personal de desarrollo",
                owner_id: users[0].id,
                is_archived: false,
                tasks: [
                    {
                        title: "Configurar entorno de desarrollo",
                        description: "Instalar y configurar todas las herramientas necesarias",
                        status: 'completed' as const,
                        priority: 'high' as const,
                        position: 1,
                        subtasks: [
                            { title: "Instalar Node.js", done: true, position: 1 },
                            { title: "Configurar VS Code", done: true, position: 2 },
                            { title: "Instalar extensiones", done: true, position: 3 }
                        ]
                    },
                    {
                        title: "Diseñar base de datos",
                        description: "Crear el modelo de datos y las migraciones",
                        status: 'in_progress' as const,
                        priority: 'high' as const,
                        position: 2,
                        subtasks: [
                            { title: "Definir entidades", done: true, position: 1 },
                            { title: "Crear migraciones", done: true, position: 2 },
                            { title: "Implementar seeders", done: false, position: 3 },
                            { title: "Configurar relaciones", done: false, position: 4 }
                        ]
                    },
                    {
                        title: "Implementar API REST",
                        description: "Crear todos los endpoints necesarios",
                        status: 'pending' as const,
                        priority: 'medium' as const,
                        position: 3,
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
                        subtasks: [
                            { title: "Endpoints de usuarios", done: false, position: 1 },
                            { title: "Endpoints de listas", done: false, position: 2 },
                            { title: "Endpoints de tareas", done: false, position: 3 },
                            { title: "Middleware de autenticación", done: false, position: 4 },
                            { title: "Validación de datos", done: false, position: 5 }
                        ]
                    }
                ]
            },
            {
                name: "Tareas de Casa",
                description: "Lista de quehaceres domésticos y mantenimiento",
                owner_id: users[0].id,
                is_archived: false,
                tasks: [
                    {
                        title: "Limpieza semanal",
                        description: "Rutina de limpieza completa de la casa",
                        status: 'pending' as const,
                        priority: 'medium' as const,
                        position: 1,
                        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 días
                        subtasks: [
                            { title: "Aspirar alfombras", done: false, position: 1 },
                            { title: "Limpiar baños", done: false, position: 2 },
                            { title: "Organizar cocina", done: false, position: 3 },
                            { title: "Cambiar sábanas", done: false, position: 4 }
                        ]
                    },
                    {
                        title: "Mantenimiento del jardín",
                        description: "Cuidado y mantenimiento del jardín",
                        status: 'in_progress' as const,
                        priority: 'low' as const,
                        position: 2,
                        subtasks: [
                            { title: "Regar plantas", done: true, position: 1 },
                            { title: "Podar arbustos", done: false, position: 2 },
                            { title: "Fertilizar césped", done: false, position: 3 }
                        ]
                    }
                ]
            },
            {
                name: "Aprendizaje",
                description: "Lista de cursos y material de estudio",
                owner_id: users[0].id,
                is_archived: false,
                tasks: [
                    {
                        title: "Curso de TypeScript",
                        description: "Completar curso avanzado de TypeScript",
                        status: 'in_progress' as const,
                        priority: 'high' as const,
                        position: 1,
                        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 días
                        subtasks: [
                            { title: "Módulo 1: Tipos básicos", done: true, position: 1 },
                            { title: "Módulo 2: Interfaces", done: true, position: 2 },
                            { title: "Módulo 3: Clases", done: false, position: 3 },
                            { title: "Módulo 4: Decoradores", done: false, position: 4 },
                            { title: "Proyecto final", done: false, position: 5 }
                        ]
                    },
                    {
                        title: "Leer libro de arquitectura",
                        description: "Clean Architecture by Robert C. Martin",
                        status: 'pending' as const,
                        priority: 'medium' as const,
                        position: 2,
                        subtasks: [
                            { title: "Capítulos 1-5", done: false, position: 1 },
                            { title: "Capítulos 6-10", done: false, position: 2 },
                            { title: "Capítulos 11-15", done: false, position: 3 },
                            { title: "Tomar notas", done: false, position: 4 }
                        ]
                    }
                ]
            }
        ];

        // Si hay más usuarios, agregar listas adicionales
        if (users.length > 1) {
            listsData.push({
                name: "Trabajo en Equipo",
                description: "Tareas colaborativas del equipo de desarrollo",
                owner_id: users[1].id,
                is_archived: false,
                tasks: [
                    {
                        title: "Sprint Planning",
                        description: "Planificación del próximo sprint",
                        status: 'completed' as const,
                        priority: 'high' as const,
                        position: 1,
                        subtasks: [
                            { title: "Revisar backlog", done: true, position: 1 },
                            { title: "Estimaciones", done: true, position: 2 },
                            { title: "Asignar tareas", done: true, position: 3 }
                        ]
                    },
                    {
                        title: "Code Review",
                        description: "Revisar pull requests pendientes",
                        status: 'in_progress' as const,
                        priority: 'high' as const,
                        position: 2,
                        subtasks: [
                            { title: "PR #123 - Auth system", done: true, position: 1 },
                            { title: "PR #124 - Database models", done: false, position: 2 },
                            { title: "PR #125 - API endpoints", done: false, position: 3 }
                        ]
                    }
                ]
            });
        }

        // Crear las listas y sus tareas/subtareas
        let totalLists = 0;
        let totalTasks = 0;
        let totalSubtasks = 0;

        for (const listData of listsData) {
            console.log(`📝 Creating list: ${listData.name}`);

            // Crear la lista
            const list = await List.createList({
                owner_id: listData.owner_id,
                name: listData.name,
                description: listData.description,
                is_archived: listData.is_archived
            });
            totalLists++;

            // Crear las tareas de la lista
            for (const taskData of listData.tasks) {
                console.log(`  ✓ Creating task: ${taskData.title}`);

                const task = await Task.createTask({
                    list_id: list.id,
                    title: taskData.title,
                    description: taskData.description,
                    status: taskData.status,
                    priority: taskData.priority,
                    position: taskData.position,
                    due_date: taskData.due_date
                });
                totalTasks++;

                // Crear las subtareas de la tarea
                if (taskData.subtasks) {
                    for (const subtaskData of taskData.subtasks) {
                        console.log(`    → Creating subtask: ${subtaskData.title}`);

                        await Subtask.createSubtask({
                            task_id: task.id,
                            title: subtaskData.title,
                            done: subtaskData.done,
                            position: subtaskData.position
                        });
                        totalSubtasks++;
                    }
                }
            }
        }

        console.log(`✅ Seeding completed!`);
        console.log(`📊 Summary:`);
        console.log(`   - Lists created: ${totalLists}`);
        console.log(`   - Tasks created: ${totalTasks}`);
        console.log(`   - Subtasks created: ${totalSubtasks}`);
        console.log(`   - Total items: ${totalLists + totalTasks + totalSubtasks}`);
    }
}
