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
    BelongsTo,
} from 'sequelize-typescript';
import { Task } from './Task';
import { List } from './List';

export interface CreateSubtaskData {
    task_id: string;
    title: string;
    done?: boolean;
    position?: number;
}

export interface UpdateSubtaskData {
    title?: string;
    done?: boolean;
    position?: number;
}

@Table({
    tableName: 'subtasks',
    timestamps: true,
    underscored: true,
})
export class Subtask extends Model<Subtask, CreateSubtaskData> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @ForeignKey(() => Task)
    @AllowNull(false)
    @Column(DataType.UUID)
    task_id!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    title!: string;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    done!: boolean;

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
    @BelongsTo(() => Task)
    task!: Task;

    // Static methods for CRUD operations

    /**
     * Get all subtasks, optionally filtered by task_id and filtered by user
     */
    static async getAllSubtasks(taskId?: string, userId?: string): Promise<Subtask[]> {
        try {
            const whereClause: any = {};
            if (taskId) whereClause.task_id = taskId;

            const includeClause: any = [];
            if (userId) {
                includeClause.push({
                    model: Task,
                    as: 'task',
                    required: true,
                    attributes: ['id', 'title', 'list_id'],
                    include: [{
                        model: List,
                        as: 'list',
                        where: { owner_id: userId },
                        required: true,
                        attributes: ['id', 'name', 'owner_id']
                    }]
                });
            }

            return await Subtask.findAll({
                where: whereClause,
                include: includeClause,
                order: [['position', 'ASC'], ['created_at', 'ASC']]
            });
        } catch (error: any) {
            console.error('Sequelize error in getAllSubtasks:', error);
            throw error;
        }
    }

    /**
     * Get subtask by ID
     */
    static async getSubtaskById(id: string): Promise<Subtask | null> {
        try {
            return await Subtask.findByPk(id);
        } catch (error) {
            console.error('Error getting subtask by ID:', error);
            throw new Error('Failed to get subtask');
        }
    }

    /**
     * Create a new subtask
     */
    static async createSubtask(data: CreateSubtaskData): Promise<Subtask> {
        try {
            const { task_id, title, done = false, position = 0 } = data;
            return await Subtask.create({ task_id, title, done, position });
        } catch (error) {
            console.error('Error creating subtask:', error);
            throw new Error('Failed to create subtask');
        }
    }

    /**
     * Update a subtask
     */
    static async updateSubtask(id: string, data: UpdateSubtaskData): Promise<Subtask | null> {
        try {
            const subtask = await Subtask.findByPk(id);
            if (!subtask) return null;

            await subtask.update(data);
            return subtask;
        } catch (error) {
            console.error('Error updating subtask:', error);
            throw new Error('Failed to update subtask');
        }
    }

    /**
     * Delete a subtask (hard delete)
     */
    static async deleteSubtask(id: string): Promise<boolean> {
        try {
            const deleted = await Subtask.destroy({ where: { id } });
            return deleted > 0;
        } catch (error) {
            console.error('Error deleting subtask:', error);
            throw new Error('Failed to delete subtask');
        }
    }

    /**
     * Toggle subtask done status
     */
    static async toggleSubtask(id: string): Promise<Subtask | null> {
        try {
            const subtask = await Subtask.findByPk(id);
            if (!subtask) return null;

            await subtask.update({ done: !subtask.done });
            return subtask;
        } catch (error) {
            console.error('Error toggling subtask:', error);
            throw new Error('Failed to toggle subtask');
        }
    }

    /**
     * Update subtask position for reordering
     */
    static async updateSubtaskPosition(id: string, position: number): Promise<Subtask | null> {
        try {
            const subtask = await Subtask.findByPk(id);
            if (!subtask) return null;

            await subtask.update({ position });
            return subtask;
        } catch (error) {
            console.error('Error updating subtask position:', error);
            throw new Error('Failed to update subtask position');
        }
    }

    /**
     * Get subtasks by completion status and filtered by user
     */
    static async getSubtasksByStatus(done: boolean, taskId?: string, userId?: string): Promise<Subtask[]> {
        try {
            const whereClause: any = { done };
            if (taskId) whereClause.task_id = taskId;

            const includeClause: any = [];
            if (userId) {
                includeClause.push({
                    model: Task,
                    as: 'task',
                    required: true,
                    attributes: ['id', 'title', 'list_id'],
                    include: [{
                        model: List,
                        as: 'list',
                        where: { owner_id: userId },
                        required: true,
                        attributes: ['id', 'name', 'owner_id']
                    }]
                });
            }

            return await Subtask.findAll({
                where: whereClause,
                include: includeClause,
                order: [['position', 'ASC'], ['created_at', 'ASC']]
            });
        } catch (error) {
            console.error('Error getting subtasks by status:', error);
            throw new Error('Failed to get subtasks by status');
        }
    }
}

export default Subtask;
