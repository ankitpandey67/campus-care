export const generateTicketNumber = async (ComplaintModel) => {
  const currentYear = new Date().getFullYear();
  const count = await ComplaintModel.countDocuments({
    ticketNumber: { $regex: `^CMP-${currentYear}-` },
  });

  const next = String(count + 1).padStart(5, '0');
  return `CMP-${currentYear}-${next}`;
};
