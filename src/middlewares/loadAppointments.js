// carrega o agendamento antes da autorização
import { appointmentService } from "../services/appointmentService.js";

export const loadAppointment = async (req, res, next) => {
	try {
    const appointment = await appointmentService.findById(req.params.id);
    req.appointment = appointment;
    next();
  } catch (err) {
    next(err);
  }
}