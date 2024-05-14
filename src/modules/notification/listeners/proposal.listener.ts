import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '~/database/typeorm/database.service';
import { NotificationService } from '~/modules/notification/notification.service';
import { ProposalEvent } from '~/modules/proposal/events/proposal.event';

@Injectable()
export class ProposalListener {
    constructor(private readonly nofiticationService: NotificationService, private readonly database: DatabaseService) { }

    @OnEvent('proposal.created')
    async handleProposalCreatedEvent(event: ProposalEvent) {
        // const entity = await this.database.proposal.findOne({ where: { id: event.id }, relations: ['repairRequest'] });
        // if (!entity) return;
        // if (entity.type === PROPOSAL_TYPE.REPAIR && entity.repairRequestId) {
        //     this.nofiticationService.createNotification({
        //         entity: 'proposal',
        //         entityId: entity.id,
        //         senderId: event.senderId,
        //         receiverIds: [entity.repairRequest.repairById, entity.repairRequest.createdById],
        //         type: 'proposal',
        //         link: `/warehouse-process/proposal`,
        //         details: [
        //             {
        //                 lang: 'vi',
        //                 title: `Yêu cầu '${entity.name}' đã được tạo`,
        //                 content: `Yêu cầu '${entity.name}' đã được tạo`,
        //             },
        //             {
        //                 lang: 'en',
        //                 title: `Proposal '${entity.name}' has been created`,
        //                 content: `Proposal '${entity.name}' has been created`,
        //             },
        //             {
        //                 lang: 'lo',
        //                 title: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
        //                 content: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
        //             },
        //         ],
        //     });
        // }
    }

    @OnEvent('proposal.pending')
    async handleProposalPendingEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        const receiverIds = await this.database.getUserIdsByPermission('proposal:headApprove');
        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds,
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đang chờ phê duyệt`,
                    content: `Yêu cầu '${entity.name}' đang chờ phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' is pending approval`,
                    content: `Proposal '${entity.name}' is pending approval`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
                    content: `ຄຳປະກາດ '${entity.name}' ແມ່ນລໍຖ້າການອະນຸມັດ`,
                },
            ],
        });
    }

    // @OnEvent('proposal.approved')
    // async handleProposalApprovedEvent(event: ProposalEvent) {
    //     const entity = await this.database.proposal.findOneBy({ id: event.id });
    //     if (!entity) return;

    //     let receiverIds: number[] = [];
    //     if (entity.type === PROPOSAL_TYPE.PURCHASE) {
    //         // notify who can create PO
    //         receiverIds = await this.database.getUserIdsByPermission('order:create');
    //     } else {
    //         receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
    //     }

    //     this.nofiticationService.createNotification({
    //         entity: 'proposal',
    //         entityId: entity.id,
    //         senderId: event.senderId,
    //         receiverIds: [...receiverIds, entity.createdById],
    //         type: 'proposal',
    //         link: `/warehouse-process/proposal`,
    //         details: [
    //             {
    //                 lang: 'vi',
    //                 title: `Yêu cầu '${entity.name}' đã được phê duyệt`,
    //                 content: `Yêu cầu '${entity.name}' đã được phê duyệt`,
    //             },
    //             {
    //                 lang: 'en',
    //                 title: `Proposal '${entity.name}' has been approved`,
    //                 content: `Proposal '${entity.name}' has been approved`,
    //             },
    //             {
    //                 lang: 'lo',
    //                 title: `ຄຳປະກາດ '${entity.name}' ໄດ້ຮັບອະນຸມັດແລ້ວ`,
    //                 content: `ຄຳປະກາດ '${entity.name}' ໄດ້ຮັບອະນຸມັດແລ້ວ`,
    //             },
    //         ],
    //     });
    // }

    @OnEvent('proposal.headApproved')
    async handleProposalHeadApprovedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        let receiverIds: number[] = [];
        receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
        // if (entity.type === PROPOSAL_TYPE.PURCHASE) {
        //     // notify to manager
        //     receiverIds = await this.database.getUserIdsByPermission('proposal:managerApprove');
        // } else {
        //     receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');
        // }

        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đã được trưởng bộ phận phê duyệt`,
                    content: `Yêu cầu '${entity.name}' đã được trưởng bộ phận phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' has been approved by head of department`,
                    content: `Proposal '${entity.name}' has been approved by head of department`,
                },
                {
                    lang: 'lo',
                    title: `ຂໍ້ສະເໜີ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກຫົວໜ້າພະແນກ`,
                    content: `ຂໍ້ສະເໜີ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກຫົວໜ້າພະແນກ`,
                },
            ],
        });
    }

    @OnEvent('proposal.managerApproved')
    async handleProposalManagerApprovedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        let receiverIds: number[] = [];
        receiverIds = await this.database.getUserIdsByPermission('warehousingBill:create');

        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [...receiverIds, entity.createdById],
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đã được ban lãnh đạo phê duyệt`,
                    content: `Yêu cầu '${entity.name}' đã được ban lãnh đạo phê duyệt`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' has been approved by management`,
                    content: `Proposal '${entity.name}' has been approved by management`,
                },
                {
                    lang: 'lo',
                    title: `ການຮ້ອງຂໍ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກການຈັດການ`,
                    content: `ການຮ້ອງຂໍ '${entity.name}' ໄດ້ຮັບການອະນຸມັດຈາກການຈັດການ`,
                },
            ],
        });
    }

    // @OnEvent('proposal.rejected')
    // async handleProposalRejectedEvent(event: ProposalEvent) {
    //     const entity = await this.database.proposal.findOneBy({ id: event.id });
    //     if (!entity) return;

    //     this.nofiticationService.createNotification({
    //         entity: 'proposal',
    //         entityId: entity.id,
    //         senderId: event.senderId,
    //         receiverIds: [entity.createdById],
    //         type: 'proposal',
    //         link: `/warehouse-process/proposal`,
    //         details: [
    //             {
    //                 lang: 'vi',
    //                 title: `Yêu cầu '${entity.name}' đã bị từ chối`,
    //                 content: `Yêu cầu '${entity.name}' đã bị từ chối`,
    //             },
    //             {
    //                 lang: 'en',
    //                 title: `Proposal '${entity.name}' has been rejected`,
    //                 content: `Proposal '${entity.name}' has been rejected`,
    //             },
    //             {
    //                 lang: 'lo',
    //                 title: `ຄຳປະກາດ '${entity.name}' ໄດ້ຖືກປະຕິບັດ`,
    //                 content: `ຄຳປະກາດ '${entity.name}' ໄດ້ຖືກປະຕິບັດ`,
    //             },
    //         ],
    //     });
    // }

    @OnEvent('proposal.headRejected')
    async handleProposalHeadRejectedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đã bị trưởng bộ phận từ chối`,
                    content: `Yêu cầu '${entity.name}' đã bị trưởng bộ phận từ chối`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' has been rejected by head of department`,
                    content: `Proposal '${entity.name}' has been rejected by head of department`,
                },
                {
                    lang: 'lo',
                    title: `ຂໍ້ສະເໜີ '${entity.name}' ໄດ້ຖືກປະຕິເສດໂດຍຫົວໜ້າພະແນກ`,
                    content: `ຂໍ້ສະເໜີ '${entity.name}' ໄດ້ຖືກປະຕິເສດໂດຍຫົວໜ້າພະແນກ`,
                },
            ],
        });
    }

    @OnEvent('proposal.managerRejected')
    async handleProposalManagerRejectedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đã bị ban lãnh đạo từ chối`,
                    content: `Yêu cầu '${entity.name}' đã bị ban lãnh đạo từ chối`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' has been rejected by management`,
                    content: `Proposal '${entity.name}' has been rejected by management`,
                },
                {
                    lang: 'lo',
                    title: `ການຮ້ອງຂໍ '${entity.name}' ໄດ້ຖືກປະຕິເສດໂດຍການຈັດການ`,
                    content: `ການຮ້ອງຂໍ '${entity.name}' ໄດ້ຖືກປະຕິເສດໂດຍການຈັດການ`,
                },
            ],
        });
    }

    @OnEvent('proposal.returned')
    async handleProposalReturnedEvent(event: ProposalEvent) {
        const entity = await this.database.proposal.findOneBy({ id: event.id });
        if (!entity) return;

        this.nofiticationService.createNotification({
            entity: 'proposal',
            entityId: entity.id,
            senderId: event.senderId,
            receiverIds: [entity.createdById],
            type: 'proposal',
            link: `/warehouse-process/proposal`,
            details: [
                {
                    lang: 'vi',
                    title: `Yêu cầu '${entity.name}' đã bị trả lại`,
                    content: `Yêu cầu '${entity.name}' đã bị trả lại`,
                },
                {
                    lang: 'en',
                    title: `Proposal '${entity.name}' has been returned`,
                    content: `Proposal '${entity.name}' has been returned`,
                },
                {
                    lang: 'lo',
                    title: `ຄຳປະກາດ '${entity.name}' ໄດ້ຖືກສົ່ງຄືນ`,
                    content: `ຄຳປະກາດ '${entity.name}' ໄດ້ຖືກສົ່ງຄືນ`,
                },
            ],
        });
    }

    // @OnEvent('proposal.headApproved')
    // @OnEvent('proposal.headRejected')
    // @OnEvent('proposal.managerApproved')
    // @OnEvent('proposal.managerRejected')
    // @OnEvent('proposal.administrativeApproved')
    // @OnEvent('proposal.administrativeRejected')
    // @OnEvent('proposal.bodApproved')
    // @OnEvent('proposal.bodRejected')
}
