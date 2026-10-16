"""Robust (S-type) PCA via IRLS, and its EMPCA (Bailey 2012) formulation.

Notation follows the accompanying note:
  X (n x p) data, omega (n x p) Bailey weights (0 = missing),
  W_t day weights, B (p x q) orthonormal basis, mu centre.
"""
import importlib.util
import numpy as np

import os
EMPCA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "third_party", "empca", "empca.py")
_spec = importlib.util.spec_from_file_location("empca_bailey", EMPCA_PATH)
empca_bailey = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(empca_bailey)


# ---------- scale ----------------------------------------------------------
def rho_bisq(u):
    u = np.minimum(np.abs(u), 1.0)
    return 1.0 - (1.0 - u**2) ** 3


def g_prime(t):
    """W(u) = rho'(u)/u = 2 g'(u^2), g(t)=rho(sqrt t); constant 6 dropped."""
    return np.where(t <= 1.0, (1.0 - t) ** 2, 0.0)


def mscale(r, delta=0.5, tol=1e-10, maxit=500):
    """M-scale of |r| with bisquare rho (c=1): mean rho(r/s) = delta."""
    r = np.abs(r)
    s = np.median(r) / 0.6745
    if s <= 0:
        return 0.0
    for _ in range(maxit):
        s1 = s * np.sqrt(np.mean(rho_bisq(r / s)) / delta)
        if abs(s1 - s) <= tol * s:
            return s1
        s = s1
    return s


# ---------- helpers --------------------------------------------------------
def spatial_median(X, tol=1e-10, maxit=1000):
    m = np.median(X, axis=0)
    for _ in range(maxit):
        d = np.maximum(np.linalg.norm(X - m, axis=1), 1e-12)
        m1 = (X / d[:, None]).sum(0) / (1.0 / d).sum()
        if np.linalg.norm(m1 - m) < tol * (1 + np.linalg.norm(m)):
            return m1
        m = m1
    return m


def top_eig(C, q):
    lam, V = np.linalg.eigh(C)
    idx = np.argsort(lam)[::-1][:q]
    return lam[idx], V[:, idx]


def spherical_pca(X, q):
    mu = spatial_median(X)
    Z = X - mu
    Z = Z / np.maximum(np.linalg.norm(Z, axis=1), 1e-12)[:, None]
    _, B = top_eig(Z.T @ Z, q)
    return mu, B


def resid2(X, mu, B):
    Xc = X - mu
    return np.sum(Xc**2, 1) - np.sum((Xc @ B) ** 2, 1)


# ---------- S-PCA, eigen step (Maronna 2005; RobStatTM::pcaRobS) -----------
def spca(X, q, delta=0.5, maxit=100, tol=1e-4):
    mu, B = spherical_pca(X, q)
    r2 = resid2(X, mu, B)
    s2 = mscale(np.sqrt(r2), delta) ** 2
    hist = [np.sqrt(s2)]
    for _ in range(maxit):
        W = g_prime(r2 / s2)
        mu = (W[:, None] * X).sum(0) / W.sum()
        Xc = X - mu
        _, Bn = top_eig((Xc * W[:, None]).T @ Xc, q)
        r2 = resid2(X, mu, Bn)
        s2n = mscale(np.sqrt(r2), delta) ** 2
        dchg = np.mean(np.abs(np.eye(q) - np.abs(Bn.T @ B)))
        d1 = 1 - s2n / s2
        B, s2 = Bn, s2n
        hist.append(np.sqrt(s2))
        if max(d1, dchg) < tol:
            break
    return dict(mu=mu, B=B, W=g_prime(r2 / s2), sigma=np.sqrt(s2), hist=np.array(hist))


# ---------- robust EMPCA: outer IRLS around Bailey's EMPCA ------------------
def _resid2_omega(X, omega, mu, B, coeff):
    E = X - mu - coeff @ B.T
    m = (omega > 0).sum(1)
    p = X.shape[1]
    return (p / m) * np.sum(omega * E**2, 1)


def _weighted_centre(X, omega_eff, model):
    num = (omega_eff * (X - model)).sum(0)
    den = omega_eff.sum(0)
    return num / den


def robust_empca(X, q, omega=None, delta=0.5, outer=100, inner=5, tol=1e-6,
                 init=None, mstep="bailey"):
    """Outer loop: day weights W_t from M-scale of residuals.
    Inner loop: Bailey's EMPCA (solve_coeffs / solve_eigenvectors) on
    centred data with Bailey weights  W_t * omega_tj * p/m_t,
    plus the weighted centre update."""
    n, p = X.shape
    if omega is None:
        omega = np.ones_like(X)
    obs = omega > 0
    Xf = np.where(obs, X, 0.0)                       # value irrelevant where omega=0
    m = obs.sum(1)
    if init is None:                                 # spherical start on observed cells
        mu = np.array([np.median(Xf[obs[:, j], j]) for j in range(p)])
        Z = np.where(obs, Xf - mu, 0.0)
        Z = Z / np.maximum(np.sqrt((p / m) * np.sum(omega * Z**2, 1)), 1e-12)[:, None]
        mod = empca_bailey.Model(empca_bailey._random_orthonormal(q, p, seed=1), Z, omega.copy())
        for _ in range(50):
            mod.solve_coeffs(); mod.solve_eigenvectors()
        mod.solve_coeffs()
        B = mod.eigvec.T.copy()
    else:
        mu, B = init
    base = omega * (p / m)[:, None]
    W = np.ones(n)
    # initial coefficients (E-step) and scale
    mod = empca_bailey.Model(B.T.copy(), Xf - mu, base * W[:, None])
    r2 = _resid2_omega(Xf, omega, mu, mod.eigvec.T, mod.coeff)
    s = mscale(np.sqrt(r2), delta)
    hist, Lchk = [s], []
    for _ in range(outer):
        W = g_prime(r2 / s**2)
        Weff = base * W[:, None]
        # inner: alternate centre / Bailey EMPCA sweeps, all with weights fixed
        L0 = np.sum(Weff * (Xf - mu - mod.coeff @ mod.eigvec) ** 2)
        for _ in range(inner):
            mu = _weighted_centre(Xf, Weff, mod.coeff @ mod.eigvec)
            mod.set_data(Xf - mu, Weff)              # E-step with new centre
            if mstep == "bailey":
                mod.solve_eigenvectors()             # Bailey M-step (+ Gram-Schmidt)
            else:                                    # exact block minimisation over Phi
                Cc, D = mod.coeff, Xf - mu
                Phi = np.empty((q, p))
                for j in range(p):
                    w = Weff[:, j]
                    Phi[:, j] = np.linalg.solve(Cc.T @ (w[:, None] * Cc), Cc.T @ (w * D[:, j]))
                Q, _ = np.linalg.qr(Phi.T)           # same span, orthonormal basis
                mod.eigvec = Q.T.copy()
            mod.solve_coeffs()                       # E-step
        L1 = np.sum(Weff * (Xf - mu - mod.coeff @ mod.eigvec) ** 2)
        Lchk.append((L0, L1))
        r2 = _resid2_omega(Xf, omega, mu, mod.eigvec.T, mod.coeff)
        s_new = mscale(np.sqrt(r2), delta)
        hist.append(s_new)
        done = abs(s - s_new) <= tol * s
        s = s_new
        if done:
            break
    out = dict(mu=mu, B=mod.eigvec.T.copy(), coeff=mod.coeff.copy(),
               W=g_prime(r2 / s**2), sigma=s, hist=np.array(hist), L=np.array(Lchk))
    return out


# ---------- stage 2: robust rotation inside the estimated subspace ---------
def rotate_within(X, mu, B, omega=None, coeff=None, seed=0):
    from sklearn.covariance import MinCovDet
    S = (X - mu) @ B if coeff is None else coeff
    mcd = MinCovDet(random_state=seed).fit(S)
    lam, V = top_eig(mcd.covariance_, B.shape[1])
    return B @ V, lam


# ---------- other estimators -------------------------------------------------
def classical(X, q):
    Xc = X - X.mean(0)
    return top_eig(Xc.T @ Xc / (len(X) - 1), q)[1]


def norm_cap(X, q, k=4.0, power=2):
    """Day weight u_t = min(1, c/||x_t - m||)^power, m = spatial median."""
    m = spatial_median(X)
    Xc = X - m
    r = np.linalg.norm(Xc, axis=1)
    w = np.minimum(1.0, k * np.median(r) / r) ** power
    mu = (w[:, None] * X).sum(0) / w.sum()
    Xc = X - mu
    return top_eig((Xc * w[:, None]).T @ Xc, q)[1]


# ---------- metrics ----------------------------------------------------------
def subspace_angle(B, L):
    s = np.linalg.svd(B.T @ L, compute_uv=False)
    return np.degrees(np.arccos(np.clip(s.min(), -1, 1)))


def pc_angles(B, L):
    return np.degrees(np.arccos(np.clip(np.abs(np.sum(B * L, 0)), 0, 1)))
