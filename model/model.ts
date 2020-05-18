import {Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne} from 'typeorm';

@Entity()
export class ClaRoom extends BaseEntity{
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    speakerPassword: string;

    @Column()
    attendeePassword: string;

    @Column()
    description: string;

    @Column()
    createTime: string;

    @Column()
    lastActiveTime: string;
}

@Entity()
export class ClaDocs extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    roomId: string;

    @Column()
    fileName: string;

    @Column()
    uploadTime: string;

    @OneToMany(type => ClaDocPages, page => page.doc)
    pages: ClaDocPages[];
}

@Entity()
export class ClaDocPages extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    page: number;

    @Column()
    path: string;

    @ManyToOne(type => ClaDocs, doc=>doc.pages)
    doc: ClaDocs;
}