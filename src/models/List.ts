import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    Default,
} from 'sequelize-typescript';
import { User } from './User';

export interface CreateListData {
    owner_id: string;
    name: string;
    description?: string;
    is_archived?: boolean;
}

export interface UpdateListData {
    name?: string;
    description?: string;
    is_archived?: boolean;
}

@Table({
    tableName: 'lists',
    timestamps: true,
    underscored: true,
})
export class List extends Model<List, CreateListData> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    owner_id!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    name!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    description?: string;

    @Default(false)
    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    is_archived!: boolean;

    @CreatedAt
    @Column(DataType.DATE)
    created_at!: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    updated_at!: Date;


    static async getAllLists(ownerId?: string): Promise<List[]> {
        try {
            const whereClause: any = {};
            if (ownerId) whereClause.owner_id = ownerId;

            return await List.findAll({ where: whereClause, order: [['created_at', 'DESC']] });
        } catch (error: any) {
            console.error('Sequelize error in getAllLists:', error); // 👈 imprime todo
            throw error; // 👈 lanza el error real, no el mensaje genérico
        }
    }


    /**
     * Crear una nueva lista
     */
    static async createList(data: CreateListData): Promise<List> {
        try {
            const { owner_id, name, description, is_archived = false } = data;
            return await List.create({ owner_id, name, description, is_archived });
        } catch (error) {
            console.error('Error creating list:', error);
            throw new Error('Failed to create list');
        }
    }

    /**
     * Actualizar una lista
     */
    static async updateList(id: string, data: UpdateListData): Promise<List | null> {
        try {
            const list = await List.findByPk(id);
            if (!list) return null;

            await list.update(data);
            return list;
        } catch (error) {
            console.error('Error updating list:', error);
            throw new Error('Failed to update list');
        }
    }

    /**
     * Eliminar una lista (hard delete)
     */
    static async deleteList(id: string): Promise<boolean> {
        try {
            const deleted = await List.destroy({ where: { id } });
            return deleted > 0;
        } catch (error) {
            console.error('Error deleting list:', error);
            throw new Error('Failed to delete list');
        }
    }

    /**
     * Archivar / desarchivar lista (soft delete estilo toggle)
     */
    static async toggleArchive(id: string, archive: boolean = true): Promise<List | null> {
        try {
            const list = await List.findByPk(id);
            if (!list) return null;

            await list.update({ is_archived: archive });
            return list;
        } catch (error) {
            console.error('Error archiving list:', error);
            throw new Error('Failed to archive list');
        }
    }
}

export default List;
