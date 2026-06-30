import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { store } from './store/store';
import { Layout } from './components/Layout';
// Placeholder imports for pages
import Home from './pages/Home';
import GameVariantSelect from './pages/GameVariantSelect';
import DefaultGame from './pages/DefaultGame';
import Instructions from './pages/Instructions';
import CreateCustomGame from './pages/CreateCustomGame';
import CustomGame from './pages/CustomGame';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<GameVariantSelect />} />
            <Route path="/game/:variant" element={<DefaultGame />} />
            <Route path="/create" element={<CreateCustomGame />} />
            <Route path="/custom/:slug" element={<CustomGame />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
