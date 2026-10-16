import sys, json, subprocess, warnings
import numpy as np
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import robpca as rp
warnings.filterwarnings("ignore")
OUT = __import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "out")
import os; os.makedirs(OUT, exist_ok=True)

tau = np.array([0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30])
L = np.column_stack([np.ones_like(tau), np.exp(-tau / 2), (tau / 2) * np.exp(-tau / 2)])
L, _ = np.linalg.qr(L)
L = L * np.sign(L[0])  # fix signs
q, n, p = 3, 750, len(tau)


def simulate(seed, shock=None, size=18.0, miss=0.0):
    rng = np.random.default_rng(seed)
    F = rng.normal(size=(n, 3)) * np.array([6, 3, 1.5])
    X = F @ L.T + rng.normal(scale=0.4, size=(n, p))
    med = np.median(np.linalg.norm(X - X.mean(0), axis=1))
    if shock == "off":
        u = np.r_[np.ones(4), -np.linspace(0.3, 1, 6)]
    elif shock == "inspan":
        u = L[:, 0] + L[:, 1]
    if shock:
        X[400] = size * med * u / np.linalg.norm(u)
    omega = np.ones_like(X)
    if miss > 0:
        M = rng.random(X.shape) < miss
        M[400] = False
        omega[M] = 0.0
    return X, omega


def per_pc(B):  # align order by matching to truth (sign-invariant), report per-PC angles
    return rp.pc_angles(B, L)


# ---- E1: Python S-PCA vs R pcaRobS on identical data -----------------------
X, _ = simulate(1, "off")
np.savetxt(f"{OUT}/e1.csv", X, delimiter=",")
r = subprocess.run(["Rscript", "-e",
    f'suppressMessages(library(RobStatTM)); X<-as.matrix(read.csv("{OUT}/e1.csv",header=FALSE));'
    f'r<-pcaRobS(X,3,desprop=1); write.table(r$eigvec,"{OUT}/e1_R.csv",sep=",",row.names=FALSE,col.names=FALSE)'],
    capture_output=True, text=True)
BR = np.loadtxt(f"{OUT}/e1_R.csv", delimiter=",")
sp = rp.spca(X, q)
e1 = dict(angle_py_vs_R=rp.subspace_angle(sp["B"], BR),
          pc_angles_py_vs_R=rp.pc_angles(sp["B"], BR).tolist(),
          sigma_path=sp["hist"].tolist(), shock_weight=float(sp["W"][400]))

# ---- E2: robust EMPCA (Bailey inner loop) vs eigen S-PCA; missing data ------
re = rp.robust_empca(X, q)
e2 = dict(full_angle_empca_vs_spca=rp.subspace_angle(re["B"], sp["B"]),
          full_angle_empca_truth=rp.subspace_angle(re["B"], L),
          sigma_monotone=bool(np.all(np.diff(re["hist"]) <= 1e-12 * re["hist"][0])),
          inner_L_decrease=bool(np.all(re["L"][:, 1] <= re["L"][:, 0] * (1 + 1e-12))),
          outer_iters=len(re["hist"]) - 1, shock_weight=float(re["W"][400]))
res_miss = []
for seed in range(10):
    Xm, om = simulate(100 + seed, "off", miss=0.10)
    rr = rp.robust_empca(Xm, q, omega=om)
    m = empca_classic = rp.empca_bailey.empca(np.where(om > 0, Xm - np.nanmean(np.where(om > 0, Xm, np.nan), 0), 0),
                                             om, niter=50, nvec=q, silent=True)
    res_miss.append([rp.subspace_angle(rr["B"], L), rp.subspace_angle(m.eigvec.T, L),
                     float(np.all(np.diff(rr["hist"]) <= 1e-12 * rr["hist"][0])),
                     float(np.all(rr["L"][:, 1] <= rr["L"][:, 0] * (1 + 1e-12)))])
res_miss = np.array(res_miss)
e2.update(miss10_robust_mean=res_miss[:, 0].mean(), miss10_robust_max=res_miss[:, 0].max(),
          miss10_classicEMPCA_mean=res_miss[:, 1].mean(),
          miss10_sigma_monotone_all=bool(res_miss[:, 2].all()),
          miss10_inner_decrease_all=bool(res_miss[:, 3].all()))

# ---- E3: Monte Carlo, two shock types --------------------------------------
methods = ["classical", "dropped", "cap_w", "cap_w2", "spca", "spca_rot", "rempca", "rempca_rot"]
e3 = {}
for shock in ["off", "inspan"]:
    sub = {m_: [] for m_ in methods}; pcs = {m_: [] for m_ in methods}
    for seed in range(30):
        X, _ = simulate(seed, shock)
        Bs = {}
        Bs["classical"] = rp.classical(X, q)
        Bs["dropped"] = rp.classical(np.delete(X, 400, 0), q)
        Bs["cap_w"] = rp.norm_cap(X, q, power=1)
        Bs["cap_w2"] = rp.norm_cap(X, q, power=2)
        s_ = rp.spca(X, q); Bs["spca"] = s_["B"]
        Bs["spca_rot"] = rp.rotate_within(X, s_["mu"], s_["B"])[0]
        r_ = rp.robust_empca(X, q); Bs["rempca"] = r_["B"]
        Bs["rempca_rot"] = rp.rotate_within(X, r_["mu"], r_["B"], coeff=r_["coeff"])[0]
        for m_ in methods:
            B = Bs[m_]
            # order components by matching to truth for the per-PC metric
            C = np.abs(B.T @ L); order = [int(np.argmax(C[:, k])) for k in range(q)]
            sub[m_].append(rp.subspace_angle(B, L)); pcs[m_].append(per_pc(B[:, order]))
    e3[shock] = {m_: dict(sub_mean=float(np.mean(sub[m_])), sub_max=float(np.max(sub[m_])),
                          pc_mean=np.mean(pcs[m_], 0).round(2).tolist(),
                          pc_max=np.max(pcs[m_], 0).round(2).tolist()) for m_ in methods}

# ---- E4: efficiency on clean data vs delta ----------------------------------
e4 = {}
for d in [0.5, 0.25, 0.1]:
    e4[f"spca_delta{d}"] = float(np.mean([rp.subspace_angle(rp.spca(simulate(s)[0], q, delta=d)["B"], L) for s in range(30)]))
e4["classical"] = float(np.mean([rp.subspace_angle(rp.classical(simulate(s)[0], q), L) for s in range(30)]))
e4["cap_w2"] = float(np.mean([rp.subspace_angle(rp.norm_cap(simulate(s)[0], q), L) for s in range(30)]))

# ---- share of variance taken by the shock day under classical PCA -----------
X, _ = simulate(0, "off")
Xc = X - X.mean(0)
share = float(np.sum(Xc[400] ** 2) / np.sum(Xc ** 2))

json.dump(dict(e1=e1, e2=e2, e3=e3, e4=e4, shock_share=share), open(f"{OUT}/results.json", "w"), indent=1)
print(json.dumps(dict(e1=e1, e2=e2, e4=e4, shock_share=share), indent=1))
for shock in e3:
    print("\n", shock)
    for m_, v in e3[shock].items():
        print(f"{m_:12s} sub {v['sub_mean']:6.2f} ({v['sub_max']:6.2f})  PCs {v['pc_mean']}  max {v['pc_max']}")
