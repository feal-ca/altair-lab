import { DATASETS } from './content/datasets.js'
import { useStoredState } from './lib/useStoredState.js'
import { resetState } from './lib/storage.js'
import { useRoute, allExercises } from './lib/router.js'
import { TopBar } from './components/TopBar.jsx'
import { Rail } from './components/Rail.jsx'
import { ExercisePage } from './pages/ExercisePage.jsx'
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
  // TODO(Task 11): open the exercise-generator dialog here.
  const onNewExercise = () => {}

  const exercise = route.name === 'ex' ? exercises.find((e) => e.id === route.id) ?? exercises[0] : null

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
        <main className="placeholder">
          {/* TODO(Task 11): Sandbox page. */}
          <p>
            Sandbox for {DATASETS[route.id]?.name ?? route.id ?? 'a dataset'} is coming soon.
          </p>
        </main>
      )}
    </div>
  )
}
