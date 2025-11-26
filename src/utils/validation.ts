import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const memberSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email'),
  phone: yup.string(),
  dateOfBirth: yup.date(),
  gender: yup.string().oneOf(['male', 'female', 'other']),
  membershipStatus: yup.string().required('Membership status is required'),
});

export const eventSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  type: yup.string().required('Event type is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string(),
  location: yup.string(),
  description: yup.string(),
  registrationRequired: yup.boolean(),
  capacity: yup.number().positive(),
});

export const donationSchema = yup.object().shape({
  donorId: yup.string().required('Donor is required'),
  amount: yup.number().positive('Amount must be positive').required('Amount is required'),
  date: yup.string().required('Date is required'),
  type: yup.string().required('Donation type is required'),
  method: yup.string().required('Payment method is required'),
});

export const groupSchema = yup.object().shape({
  name: yup.string().required('Group name is required'),
  type: yup.string().required('Group type is required'),
  leaderId: yup.string().required('Leader is required'),
});

