import { DATASETS } from './content/datasets.js'
import { useState } from 'react'
import { useStoredState } from './lib/useStoredState.js'
import { resetState } from './lib/storage.js'
import { useRoute, allExercises } from './lib/router.js'
import { TopBar } from './components/TopBar.jsx'
import { Rail } from './components/Rail.jsx'
import { ExercisePage } from './pages/ExercisePage.jsx'
import { SandboxPage } from './pages/SandboxPage.jsx'
import { NewExerciseDialog } from './components/NewExerciseDialog.jsx'
import './App.css'

export default function App() {
  const [state, update, saveOk] = useStoredState()
  const route = useRoute()
  const collapsed = state.railCollapsed === true
  const exercises = allExercises(state)

  const onReset = () => {
    if (window.confirm('Reset all progress and saved code? This cannot be undone.')) {
      const fresh = resetState()
      update(() => fresh)
    }
  }
  const [dialogOpen, setDialogOpen] = useState(false)
  const onNewExercise = () => setDialogOpen(true)

  const exercise = route.name === 'ex' ? exercises.find((e) => e.id === route.id) ?? exercises[0] : null

  const sandboxDataset =
    route.name === 'sandbox'
      ? DATASETS[route.id] ?? state.datasets?.[route.id] ?? Object.values(DATASETS)[0]
      : null

  return (
    <div className="app">
      <TopBar
        route={route}
        railCollapsed={collapsed}
        saveOk={saveOk}
        onToggleRail={() => update((s) => ({ ...s, railCollapsed: !collapsed }))}
      />
      {exercise ? (
        <main className="shell" style={{ '--rail-w': collapsed ? '0px' : '170px' }}>
          <Rail
            exercises={exercises}
            state={state}
            activeId={exercise.id}
            onNewExercise={onNewExercise}
            onReset={onReset}
          />
          <ExercisePage key={exercise.id} exercise={exercise} state={state} update={update} />
        </main>
      ) : (
        <main className="shell" style={{ '--rail-w': '170px' }}>
          <SandboxPage key={sandboxDataset.id} dataset={sandboxDataset} state={state} update={update} />
        </main>
      )}
      <NewExerciseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} state={state} update={update} />
    </div>
  )
}
