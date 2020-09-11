"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaDocPages = exports.ClaDocs = exports.ClaRoom = void 0;
const typeorm_1 = require("typeorm");
let ClaRoom = class ClaRoom extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], ClaRoom.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "speakerPassword", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "attendeePassword", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "description", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "createTime", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaRoom.prototype, "lastActiveTime", void 0);
ClaRoom = __decorate([
    typeorm_1.Entity()
], ClaRoom);
exports.ClaRoom = ClaRoom;
let ClaDocs = class ClaDocs extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], ClaDocs.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaDocs.prototype, "roomId", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaDocs.prototype, "fileName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaDocs.prototype, "uploadTime", void 0);
__decorate([
    typeorm_1.OneToMany(type => ClaDocPages, page => page.doc),
    __metadata("design:type", Array)
], ClaDocs.prototype, "pages", void 0);
ClaDocs = __decorate([
    typeorm_1.Entity()
], ClaDocs);
exports.ClaDocs = ClaDocs;
let ClaDocPages = class ClaDocPages extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], ClaDocPages.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], ClaDocPages.prototype, "page", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], ClaDocPages.prototype, "path", void 0);
__decorate([
    typeorm_1.ManyToOne(type => ClaDocs, doc => doc.pages),
    __metadata("design:type", ClaDocs)
], ClaDocPages.prototype, "doc", void 0);
ClaDocPages = __decorate([
    typeorm_1.Entity()
], ClaDocPages);
exports.ClaDocPages = ClaDocPages;
