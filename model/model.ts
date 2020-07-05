/*
	 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
	 *
	 * This program is free software: you can use, redistribute, and/or modify
	 * it under the terms of the GNU Affero General Public License, version 3
	 * or later ("AGPL"), as published by the Free Software Foundation.
	 *
	 * This program is distributed in the hope that it will be useful, but WITHOUT
	 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
	 * FITNESS FOR A PARTICULAR PURPOSE.
	 *
	 * You should have received a copy of the GNU Affero General Public License
	 * along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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