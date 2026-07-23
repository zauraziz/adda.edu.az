/**
 * F2.6d - correction lifecycle (hardening)
 * Public "create" icazesi aciqdir; submitter status/moderator sahelerini
 * inject ede bilmesin deye her yeni duzelis MECBURI "pending" baslayir.
 */
type CreateEvent = { params: { data: Record<string, unknown> } };

export default {
  async beforeCreate(event: CreateEvent) {
    const data = event.params.data;
    data.status = "pending";
    delete data.moderatorNote;
  },
};
