import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    Default,
    HasMany,
    BelongsTo,
} from 'sequelize-typescript';
import { List } from './List';
import { Subtask } from './Subtask';

export interface CreateTaskData {
    list_id: string;
    title: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: Date;
    position?: number;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: Date;
    position?: number;
}

@Table({
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
})
export class Task extends Model<Task, CreateTaskData> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @ForeignKey(() => List)
    @AllowNull(false)
    @Column(DataType.UUID)
    list_id!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    title!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description?: string;

    @Default('pending')
    @AllowNull(false)
    @Column(DataType.ENUM('pending', 'in_progress', 'completed', 'cancelled'))
    status!: 'pending' | 'in_progress' | 'completed' | 'cancelled';

    @Default('medium')
    @AllowNull(false)
    @Column(DataType.ENUM('low', 'medium', 'high', 'urgent'))
    priority!: 'low' | 'medium' | 'high' | 'urgent';

    @AllowNull(true)
    @Column(DataType.DATE)
    due_date?: Date;

    @Default(0)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    position!: number;

    @CreatedAt
    @Column(DataType.DATE)
    created_at!: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updated_at!: Date;

    // Associations
    @BelongsTo(() => List)
    list!: List;

    @HasMany(() => Subtask)
    subtasks!: Subtask[];

    // Static methods for CRUD operations

    /**
     * Get all tasks, optionally filtered by list_id
     */
    static async getAllTasks(listId?: string): Promise<Task[]> {
        try {
            const whereClause: any = {};
            if (listId) whereClause.list_id = listId;

            return await Task.findAll({
                where: whereClause,
                order: [['position', 'ASC'], ['created_at', 'DESC']]
                // include: [
                //     {
                //         model: Subtask,
                //         as: 'subtasks',
                //         order: [['position', 'ASC']]
                //     }
                // ]
            });
        } catch (error: any) {
            console.error('Sequelize error in getAllTasks:', error);
            throw error;
        }
    }

    /**
     * Get task by ID with subtasks
     */
    static async getTaskById(id: string): Promise<Task | null> {
        try {
            return await Task.findByPk(id);
            // return await Task.findByPk(id, {
            //     include: [
            //         {
            //             model: Subtask,
            //             as: 'subtasks',
            //             order: [['position', 'ASC']]
            //         }
            //     ]
            // });
        } catch (error) {
            console.error('Error getting task by ID:', error);
            throw new Error('Failed to get task');
        }
    }

    /**
     * Create a new task
     */
    static async createTask(data: CreateTaskData): Promise<Task> {
        try {
            const { list_id, title, description, status = 'pending', priority = 'medium', due_date, position = 0 } = data;
            return await Task.create({
                list_id,
                title,
                description,
                status,
                priority,
                due_date,
                position
            });
        } catch (error) {
            console.error('Error creating task:', error);
            throw new Error('Failed to create task');
        }
    }

    /**
     * Update a task
     */
    static async updateTask(id: string, data: UpdateTaskData): Promise<Task | null> {
        try {
            const task = await Task.findByPk(id);
            if (!task) return null;

            await task.update(data);
            return task;
        } catch (error) {
            console.error('Error updating task:', error);
            throw new Error('Failed to update task');
        }
    }

    /**
     * Delete a task (hard delete)
     */
    static async deleteTask(id: string): Promise<boolean> {
        try {
            const deleted = await Task.destroy({ where: { id } });
            return deleted > 0;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw new Error('Failed to delete task');
        }
    }

    /**
     * Update task status
     */
    static async updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<Task | null> {
        try {
            const task = await Task.findByPk(id);
            if (!task) return null;

            await task.update({ status });
            return task;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw new Error('Failed to update task status');
        }
    }

    /**
     * Update task position for reordering
     */
    static async updateTaskPosition(id: string, position: number): Promise<Task | null> {
        try {
            const task = await Task.findByPk(id);
            if (!task) return null;

            await task.update({ position });
            return task;
        } catch (error) {
            console.error('Error updating task position:', error);
            throw new Error('Failed to update task position');
        }
    }

    /**
     * Get tasks by status
     */
    static async getTasksByStatus(status: 'pending' | 'in_progress' | 'completed' | 'cancelled', listId?: string): Promise<Task[]> {
        try {
            const whereClause: any = { status };
            if (listId) whereClause.list_id = listId;

            return await Task.findAll({
                where: whereClause,
                order: [['position', 'ASC'], ['created_at', 'DESC']]
                // include: [
                //     {
                //         model: Subtask,
                //         as: 'subtasks',
                //         order: [['position', 'ASC']]
                //     }
                // ]
            });
        } catch (error) {
            console.error('Error getting tasks by status:', error);
            throw new Error('Failed to get tasks by status');
        }
    }
}

export default Task;
