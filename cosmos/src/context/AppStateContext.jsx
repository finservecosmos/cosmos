import { createContext, useContext, useState } from 'react'
import {
  dummyClients, dummyAssociates, dummyPayments, dummyInvoices,
  dummyProducts, dummyReminders, dummyNotifications, dummyEnquiries,
  dummyLoginFiles, dummyBackups
} from '../lib/dummyData'

const AppStateContext = createContext()

export function AppStateProvider({ children }) {
  const [clients, setClients]             = useState(dummyClients)
  const [associates, setAssociates]       = useState(dummyAssociates)
  const [payments, setPayments]           = useState(dummyPayments)
  const [invoices, setInvoices]           = useState(dummyInvoices)
  const [products, setProducts]           = useState(dummyProducts)
  const [reminders, setReminders]         = useState(dummyReminders)
  const [notifications, setNotifications] = useState(dummyNotifications)
  const [enquiries, setEnquiries]         = useState(dummyEnquiries)
  const [loginFiles, setLoginFiles]       = useState(dummyLoginFiles)
  const [backups, setBackups]             = useState(dummyBackups)
  const [users, setUsers]                 = useState([
    { id: 1, name: 'Dev User',      email: 'dev@cosmos.local',    role: 'admin',   status: 'active' },
    { id: 2, name: 'Meena Sharma',  email: 'meena@cosmos.local',  role: 'advisor', status: 'active' },
    { id: 3, name: 'Ravi Patel',    email: 'ravi@cosmos.local',   role: 'staff',   status: 'active' },
    { id: 4, name: 'Sunita Rao',    email: 'sunita@cosmos.local', role: 'advisor', status: 'inactive' },
  ])

  const addClient    = (c)  => setClients(p => [{ ...c, id: `C${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateClient = (c)  => setClients(p => p.map(x => x.id === c.id ? c : x))
  const addAssociate    = (a) => setAssociates(p => [{ ...a, id: `A${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateAssociate = (a) => setAssociates(p => p.map(x => x.id === a.id ? a : x))
  const addPayment    = (pay) => setPayments(p => [{ ...pay, id: `P${String(p.length+1).padStart(3,'0')}` }, ...p])
  const addInvoice    = (inv) => setInvoices(p => [{ ...inv, id: `INV-${String(p.length+1).padStart(3,'0')}` }, ...p])
  const addProduct    = (pr)  => setProducts(p => [{ ...pr, id: `PS${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateProduct = (pr)  => setProducts(p => p.map(x => x.id === pr.id ? pr : x))
  const addReminder    = (r)  => setReminders(p => [{ ...r, id: `R${String(p.length+1).padStart(3,'0')}`, done: false }, ...p])
  const updateReminder = (r)  => setReminders(p => p.map(x => x.id === r.id ? r : x))
  const deleteReminder = (id) => setReminders(p => p.filter(x => x.id !== id))
  const addEnquiry    = (e)   => setEnquiries(p => [{ ...e, id: `E${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateEnquiry = (e)   => setEnquiries(p => p.map(x => x.id === e.id ? e : x))
  const removeEnquiry = (id)  => setEnquiries(p => p.filter(x => x.id !== id))
  const addLoginFile    = (f) => setLoginFiles(p => [{ ...f, id: `LF${String(p.length+1).padStart(3,'0')}` }, ...p])
  const updateLoginFile = (f) => setLoginFiles(p => p.map(x => x.id === f.id ? f : x))
  const markNotifRead   = (id) => setNotifications(p => p.map(x => x.id === id ? { ...x, read: true } : x))
  const markAllNotifsRead = () => setNotifications(p => p.map(x => ({ ...x, read: true })))
  const addUser    = (u) => setUsers(p => [{ ...u, id: p.length + 1 }, ...p])
  const updateUser = (u) => setUsers(p => p.map(x => x.id === u.id ? u : x))
  const addBackup  = (b) => setBackups(p => [b, ...p])

  return (
    <AppStateContext.Provider value={{
      clients, addClient, updateClient,
      associates, addAssociate, updateAssociate,
      payments, addPayment,
      invoices, addInvoice,
      products, addProduct, updateProduct,
      reminders, addReminder, updateReminder, deleteReminder,
      notifications, markNotifRead, markAllNotifsRead,
      enquiries, addEnquiry, updateEnquiry, removeEnquiry,
      loginFiles, addLoginFile, updateLoginFile,
      backups, addBackup,
      users, addUser, updateUser,
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  return useContext(AppStateContext)
}
