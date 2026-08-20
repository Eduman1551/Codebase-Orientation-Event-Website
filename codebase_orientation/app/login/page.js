'use client'
import React, {useState} from 'react'
import { register } from '../actions/useraction'
import { useRouter } from 'next/navigation'

const Login = () => {
    const [form, setForm] = useState({ teamName: "", memName1: "" ,memName2: "", memName3: "", memName4: ""}) 
    const router = useRouter()   

    const handleChange = (e) =>{
        setForm({...form,[e.target.name]:e.target.value})
    }
    const handleRegisteration = async (formData) => {
        const result = await register(formData)
        if (result?.error) return
        router.push("/")
    }
    
  return (
    <div>
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <form action={handleRegisteration} className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-lg">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Registration</h1>
                    <p className="mt-2 text-sm text-slate-600">Register to continue.</p>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                    Team Name
                    <input name="teamName" type="text" required value={form.teamName} onChange={handleChange} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Member Name 1
                    <input name="memName1" type="text" required value={form.memName1} onChange={handleChange} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Member Name 2
                    <input name="memName2" type="text" required value={form.memName2} onChange={handleChange} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Member Name 3
                    <input name="memName3" type="text" required value={form.memName3} onChange={handleChange} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    Member Name 4
                    <input name="memName4" type="text" required value={form.memName4} onChange={handleChange} className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500" />
                </label>

                <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700">
                    Register
                </button>
            </form>
        </main>
    </div>
  )
}

export default Login
