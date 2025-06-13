'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

interface Task {
  id: string
  title: string
  description: string
  reward: number
  link?: string
  attachment?: string
  isCompleted: boolean
  isRewardClaimed: boolean
}

export default function TasksScreen() {
  const { updateUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingTask, setCompletingTask] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await apiClient.getTasks()
      if (response.success) {
        setTasks(response.tasks)
      } else {
        setError(response.error || 'Failed to fetch tasks')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTask = async (task: Task) => {
    if (task.link) {
      // Open the link in a new tab
      window.open(task.link, '_blank')
    }

    setCompletingTask(task.id)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.completeTask(task.id)
      
      if (response.success) {
        setSuccess(`Task completed! Earned ${response.reward} HEHE tokens`)
        
        // Update the task in the list
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? { ...t, isCompleted: true, isRewardClaimed: true }
              : t
          )
        )

        // Update user balance
        updateUser({ totalBalance: response.newBalance })
      } else {
        setError(response.error || 'Failed to complete task')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setCompletingTask(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="text-center mb-8 animate-slide-up">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-3xl animate-bounce">📋</span>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Tasks
          </h2>
          <span className="text-3xl animate-bounce" style={{animationDelay: '0.3s'}}>✨</span>
        </div>
        <p className="text-gray-300 text-lg">Complete tasks to earn bonus HEHE tokens! 🎯</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6 glass animate-bounce-in">
          <div className="flex items-center space-x-3">
            <span className="text-red-400 text-xl animate-bounce">⚠️</span>
            <p className="text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-6 glass animate-bounce-in">
          <div className="flex items-center space-x-3">
            <span className="text-green-400 text-xl animate-bounce">🎉</span>
            <p className="text-green-300 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-5 animate-slide-up" style={{animationDelay: '0.2s'}}>
        {tasks.length === 0 ? (
          <div className="text-center py-12 glass-dark rounded-2xl border border-white/20">
            <span className="text-6xl mb-4 block animate-float">📋</span>
            <p className="text-gray-300 text-lg">No tasks available at the moment</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new opportunities! ✨</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className={`glass-dark rounded-2xl p-6 border hover-lift transition-all duration-300 animate-slide-up ${
                task.isCompleted
                  ? 'border-green-400/40 bg-green-500/10'
                  : 'border-white/20 hover:border-blue-400/40'
              }`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-white font-bold text-lg">{task.title}</h3>
                    {task.isCompleted && (
                      <span className="text-green-400 text-xl animate-bounce">✅</span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4 leading-relaxed">{task.description}</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 glass rounded-lg px-3 py-2">
                      <span className="text-yellow-400 text-lg animate-coin-flip">💰</span>
                      <span className="text-yellow-300 font-bold">
                        +{task.reward} HEHE
                      </span>
                    </div>
                    {task.isCompleted && (
                      <div className="flex items-center space-x-2 glass rounded-lg px-3 py-2 bg-green-500/20">
                        <span className="text-green-400 animate-pulse">✓</span>
                        <span className="text-green-300 font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  {task.isCompleted ? (
                    <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse-glow">
                      <span className="text-white text-xl animate-bounce">✓</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      disabled={completingTask === task.id}
                      className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-blue-500/25 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shimmer"></div>
                      <span className="relative z-10">
                        {completingTask === task.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Doing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="group-hover:animate-bounce">🚀</span>
                            <span>Do Task</span>
                          </div>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {task.link && !task.isCompleted && (
                <div className="glass rounded-lg p-3 mt-4 border border-blue-400/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 animate-pulse">💡</span>
                    <p className="text-blue-300 text-sm font-medium">
                      Clicking "Do Task" will open the link and mark the task as complete
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 glass-dark rounded-2xl p-6 border border-white/20 animate-slide-up" style={{animationDelay: '0.4s'}}>
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span className="text-2xl animate-bounce">📊</span>
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Task Statistics
          </h3>
          <span className="text-2xl animate-bounce" style={{animationDelay: '0.3s'}}>📈</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center glass rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-green-400 text-xl animate-pulse">✅</span>
              <p className="text-gray-300 font-medium">Completed</p>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {tasks.filter(t => t.isCompleted).length}
            </p>
          </div>
          <div className="text-center glass rounded-xl p-4 hover-lift">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-blue-400 text-xl animate-pulse">🎯</span>
              <p className="text-gray-300 font-medium">Available</p>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {tasks.filter(t => !t.isCompleted).length}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium">Progress</span>
            <span className="text-gray-300 font-medium">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 relative"
              style={{
                width: `${tasks.length > 0 ? (tasks.filter(t => t.isCompleted).length / tasks.length) * 100 : 0}%`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
